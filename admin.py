import streamlit as st
import time
from data_ingestion import data_ingestion
import pandas as pd
import matplotlib.pyplot as plt
import altair as alt
import seaborn as sns
import io
import base64
from fpdf import FPDF

st.set_page_config(page_title="Admin Dashboard", layout="wide")

# Admin Login Interface
def admin_login():
    st.title("Admin Login")
    username = st.text_input("Username")
    password = st.text_input("Password", type="password")

    # Hardcoded credentials (for now)
    if st.button("Login"):
        if username == "admin" and password == "admin123":
            st.success("Login successful!")
            with st.spinner("Redirecting to the Admin Dashboard..."):
                time.sleep(5) 
            
            st.session_state['logged_in'] = True
            st.experimental_set_query_params(logged_in="true")
            st.rerun()
        else:
            st.error("Invalid username or password.")

# Initialize the session state for login
if 'logged_in' not in st.session_state:
    st.session_state['logged_in'] = False

# Check if logged in by query params
query_params = st.experimental_get_query_params()
if query_params.get("logged_in") == ["true"]:
    st.session_state['logged_in'] = True

# Dashboard Layout
def dashboard_layout():
    _, attendance_df = data_ingestion()
    st.sidebar.title("Admin Navigation Bar")
    page = st.sidebar.selectbox("Go to", ["Overview", "Detailed Reports", "Employee Management", "Settings", "Help"])
    if page == "Overview":
        show_overview()
    elif page == "Detailed Reports":
        detailed_reports(attendance_df)
    elif page == "Employee Management":
        st.write("Employee Management content goes here.")
    elif page == "Settings":
        st.write("Settings content goes here.")
    elif page == "Help":
        st.write("Help content goes here.")

def show_overview():
    st.title("Overview")

    employee_df, attendance_df = data_ingestion()

    # Calculate metrics
    total_employees = len(employee_df)
    present_today = sum(attendance_df['Date'] == time.strftime("%Y-%m-%d"))
    absent_today = total_employees - present_today
    late_arrivals = sum(attendance_df['Attendance Status In'] == "Tardy(Late Arrival)")
    early_arrivals = sum(attendance_df['Attendance Status In'] == 'Early')

    col1, col2, col3, col4, col5 = st.columns(5)
    col1.metric("Total Employees", total_employees)
    col2.metric("Present Today", present_today)
    col3.metric("Absent Today", absent_today)
    col4.metric("Late Arrivals", late_arrivals)
    col5.metric("Early Arrival", early_arrivals)

    # Attendance Trends
    st.subheader("Attendance Trends Over Time")
    attendance_df['Date'] = pd.to_datetime(attendance_df['Date'])
    attendance_trends = attendance_df.groupby('Date').size().reset_index(name='Total Present')
    attendance_trend_chart = alt.Chart(attendance_trends).mark_line().encode(
        x='Date:T',
        y='Total Present:Q'
    )
    st.altair_chart(attendance_trend_chart, use_container_width=True)

    # Department-wise Attendance
    st.subheader("Department-wise Attendance")
    dept_attendance = attendance_df.groupby('Department').size().reset_index(name='Attendance Count')
    dept_chart = alt.Chart(dept_attendance).mark_bar().encode(
        x='Department:N',
        y='Attendance Count:Q',
        color='Department:N'
    )
    st.altair_chart(dept_chart, use_container_width=True)

    # # Corrected Heatmap code
    # st.subheader("Monthly Attendance Heatmap")
    # attendance_df['Date'] = pd.to_datetime(attendance_df['Date'])
    # attendance_df['Day'] = attendance_df['Date'].dt.day
    # attendance_df['Weekday'] = attendance_df['Date'].dt.strftime('%A')

    # # Group by date to get the attendance count per day
    # heatmap_data = attendance_df.groupby(['Day', 'Weekday']).size().reset_index(name='Attendance Count')
    # heatmap_data_pivot = heatmap_data.pivot(index='Day', columns='Weekday', values='Attendance Count')
    # heatmap_data_pivot = heatmap_data_pivot[['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']]

    # # Plotting the heatmap
    # plt.figure(figsize=(10, 6))
    # sns.heatmap(heatmap_data_pivot, cmap="YlGnBu", cbar=True)
    # st.pyplot(plt)

def detailed_reports(attendance_df):
    st.title("Detailed Attendance Reports")

    # Ensure the 'Date' column is in datetime format
    attendance_df['Date'] = pd.to_datetime(attendance_df['Date'], errors='coerce')

    # Filters
    st.sidebar.subheader("Filters")
    
    # Date Range Filter
    start_date = st.sidebar.date_input("Start Date", value=pd.to_datetime(attendance_df['Date']).min())
    end_date = st.sidebar.date_input("End Date", value=pd.to_datetime(attendance_df['Date']).max())
    
    # Department Filter
    departments = attendance_df['Department'].unique().tolist()
    selected_department = st.sidebar.multiselect("Select Department", options=departments, default=departments)
    
    # Attendance Status Filter
    status_options = ['Early', 'Leave', "Holiday", "Work from Home", "Site Work", 
                      'Late(On Official Duty)', "Tardy(Late Arrival)"]
    selected_status = st.sidebar.multiselect("Select Attendance Status", options=status_options, default=status_options)
    
    # Filtering data based on selections
    filtered_df = attendance_df[
        (attendance_df['Date'] >= pd.to_datetime(start_date)) &
        (attendance_df['Date'] <= pd.to_datetime(end_date)) &
        (attendance_df['Department'].isin(selected_department)) &
        (attendance_df['Attendance Status In'].isin(selected_status))
    ]

    # Reports
    st.subheader("Employee Attendance Report")
    
    # Displaying the filtered DataFrame
    st.dataframe(filtered_df)
    
    # Late Comers & Early Leavers
    st.subheader("Late Comers & Early Leavers Report")
    late_early_df = filtered_df[(filtered_df['Attendance Status In'] == 'Tardy(Late Arrival)') | (filtered_df['Attendance Status In'] == 'Left Early')]
    st.dataframe(late_early_df)

    # Absenteeism Report
    st.subheader("Absenteeism Report")
    absenteeism_df = filtered_df[filtered_df['Attendance Status In'] == 'Site Work']
    st.dataframe(absenteeism_df)

    # Export Options
    st.subheader("Export Options")
    
    # CSV/Excel Export
    def convert_df_to_csv(df):
        return df.to_csv(index=False).encode('utf-8')
    
    csv = convert_df_to_csv(filtered_df)
    
    st.download_button(
        label="Export to CSV",
        data=csv,
        file_name='filtered_attendance.csv',
        mime='text/csv',
    )

    def convert_df_to_excel(df):
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            df.to_excel(writer, index=False, sheet_name='Sheet1')
            writer.save()
        processed_data = output.getvalue()
        return processed_data
    
    excel = convert_df_to_excel(filtered_df)
    
    st.download_button(
        label="Export to Excel",
        data=excel,
        file_name='filtered_attendance.xlsx',
        mime='application/vnd.ms-excel',
    )

    # PDF Report Generation
    st.subheader("Generate PDF Report")
    
    def generate_pdf_report(df):
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=12)
        
        # Adding title
        pdf.cell(200, 10, txt="Attendance Report", ln=True, align='C')
        
        # Adding data
        for i, row in df.iterrows():
            pdf.cell(200, 10, txt=str(row.values), ln=True)
        
        return pdf.output(dest='S').encode('latin1')
    
    if st.button("Generate PDF"):
        pdf = generate_pdf_report(filtered_df)
        
        b64 = base64.b64encode(pdf).decode()
        href = f'<a href="data:application/octet-stream;base64,{b64}" download="attendance_report.pdf">Download PDF Report</a>'
        st.markdown(href, unsafe_allow_html=True)

if st.session_state['logged_in']:
    dashboard_layout()
else:
    admin_login()

