import streamlit as st
from data_ingestion import data_ingestion
import time 
import altair as alt
import pandas as pd 
import matplotlib.pyplot as plt
import seaborn as sns
import io
import base64
from fpdf import FPDF

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

    st.subheader("Monthly Attendance Heatmap")


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

    # def convert_df_to_excel(df):
    #     output = io.BytesIO()
    #     with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
    #         df.to_excel(writer, index=False, sheet_name='Sheet1')
    #         writer.save()
    #     processed_data = output.getvalue()
    #     return processed_data
    
    # excel = convert_df_to_excel(filtered_df)
    
    # st.download_button(
    #     label="Export to Excel",
    #     data=excel,
    #     file_name='filtered_attendance.xlsx',
    #     mime='application/vnd.ms-excel',
    # )

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

# Helper function to add a new employee
def add_employee(df, new_employee):
    # Convert the new employee dictionary to a DataFrame and concatenate it
    new_employee_df = pd.DataFrame([new_employee])
    return pd.concat([df, new_employee_df], ignore_index=True)

# Helper function to remove an employee by ID
def remove_employee(df, employee_id):
    return df[df['Employee ID'] != employee_id]

# Helper function to edit an employee's information
def edit_employee(df, employee_id, updated_info):
    df.loc[df['Employee ID'] == employee_id, list(updated_info.keys())] = list(updated_info.values())
    return df

 # Employee Management Layout
def employee_management():
    employee_df, _ = data_ingestion()
    
    st.title("Employee Management")

    # Search & Filter
    st.subheader("Search & Filter Employees")
    search_term = st.text_input("Search by Employee ID, Name, or Department")
    
    # Apply filter to the employee data
    if search_term:
        filtered_data = employee_df[
            employee_df.apply(lambda row: search_term.lower() in row.astype(str).str.lower().values, axis=1)
        ]
    else:
        filtered_data = employee_df
    
    # Display filtered data
    st.dataframe(filtered_data)

#     # Edit Employee Info
    st.subheader("Edit Employee Info")
    if not filtered_data.empty:
        edit_id = st.selectbox("Select Employee ID to Edit", filtered_data['Employee ID'].unique())
        employee_to_edit = filtered_data[filtered_data['Employee ID'] == edit_id].iloc[0]
        st.write(f"Editing Employee: {employee_to_edit['Employee Name']}")

        employee_name = st.text_input("Employee Name", value=employee_to_edit['Employee Name'])
        phone_number = st.text_input("Phone Number", value=employee_to_edit['Phone Number'])
        email_address = st.text_input("Email Address", value=employee_to_edit['E-mail Address'])
        department = st.text_input("Department", value=employee_to_edit['Department'])
        job_title = st.text_input("Job Title", value=employee_to_edit['Job Title'])
        joining_date = st.text_input("Joining Date", value=employee_to_edit['Joining Date'])
        shift_days = st.text_input("Shift Days", value=employee_to_edit['Shift Days'])
        supervisor_name = st.text_input("Supervisor Name", value=employee_to_edit['Supervisor Name'])
        Address = st.text_input("Address", value=employee_to_edit['Address'])

        if st.button("Save Changes"):
            updated_info = {
                'Employee Name': employee_name,
                "Phone Number": phone_number,
                "Email Address": email_address,
                'Department': department,
                'Job Title': job_title,
                "Joining Date": joining_date,
                "Shift Days": shift_days,
                "Supervisor Name" : supervisor_name,
                "Address": Address
                       }
    
            employee_data = edit_employee(employee_data, edit_id, updated_info)
            st.success(f"Updated Employee: {edit_id}")
            st.rerun()
    else:
        st.warning("No employees found for the search criteria.")

# Add New Employee
    st.subheader("Add New Employee")
    with st.form("add_employee_form"):
        new_employee_id = st.text_input("Employee ID")
        new_name = st.text_input("Employee Name")
        new_phone_number = st.text_input("Phone Number")
        new_email = st.text_input("E-mail Address")
        new_job_title = st.text_input("Job Title")
        new_department = st.text_input("Department")
        new_joining_date = st.date_input("Joining Date")
        new_shift_days = st.text_input("Shift Days")
        new_supervisor_name = st.text_input("Supervisor Name")
        new_address = st.text_area("Address")

        if st.form_submit_button("Add Employee"):
            if not new_employee_id or not new_name:
                st.error("Employee ID and Name are required fields.")
            else:
                new_employee = {
                    'Employee ID': new_employee_id,
                    'Name': new_name,
                    'Phone Number': new_phone_number,
                    'E-mail Address': new_email,
                    'Job Title': new_job_title,
                    'Department': new_department,
                    'Joining Date': new_joining_date,
                    'Shift Days': new_shift_days,
                    'Supervisor Name': new_supervisor_name,
                    'Address': new_address
                }
        
                employee_data = add_employee(employee_df, new_employee)
                st.success(f"Added New Employee: {new_name}")
                st.rerun()

    # Remove Employee
    st.subheader("Remove Employee")
    employee_df, _ = data_ingestion()
    remove_id = st.selectbox("Select Employee ID to Remove", employee_df['Employee ID'].unique())

# # A checkbox as a confirmation dialog replacement
    if st.button("Remove Employee"):
        if st.checkbox("Are you sure you want to remove this employee?"):
            employee_data = remove_employee(employee_df, remove_id)
            st.success(f"Removed Employee: {remove_id}")
            st.experimental_rerun()

import streamlit as st

def settings():
    st.title("Settings")

    # Notification Settings
    st.subheader("Notification Settings")
    email_notifications = st.checkbox("Enable Email Notifications")
    sms_notifications = st.checkbox("Enable SMS Notifications")

    if email_notifications:
        st.text_input("Enter Email for Notifications", placeholder="admin@example.com")
    if sms_notifications:
        st.text_input("Enter Phone Number for SMS Notifications", placeholder="+1234567890")
    
    notification_events = st.multiselect(
        "Select Events for Notifications",
        ["Late Arrival", "Early Leave", "Absenteeism", "Daily Summary"],
        default=["Late Arrival", "Early Leave"]
    )
    
    # Working Hours
    st.subheader("Working Hours")
    working_hours_start = st.time_input("Start Time", value=pd.to_datetime("09:00:00").time())
    working_hours_end = st.time_input("End Time", value=pd.to_datetime("17:00:00").time())
    break_start = st.time_input("Break Start Time", value=pd.to_datetime("12:00:00").time())
    break_end = st.time_input("Break End Time", value=pd.to_datetime("13:00:00").time())
    
    # Permissions Management
    st.subheader("Permissions")
    roles = ["Super Admin", "HR", "Team Lead", "Employee"]
    selected_role = st.selectbox("Select Role", roles)
    
    permissions = {
        "Super Admin": ["Full Access"],
        "HR": ["Manage Employees", "View Reports"],
        "Team Lead": ["View Reports", "Approve Leave"],
        "Employee": ["View Own Attendance"]
    }

    st.write(f"Permissions for {selected_role}:")
    st.write(", ".join(permissions[selected_role]))

    if st.button("Save Settings"):
        st.success("Settings updated successfully!")

def help_and_support():
    st.title("Help & Support")

    # FAQ Section
    st.subheader("Frequently Asked Questions (FAQ)")
    
    faqs = {
        "How do I add a new employee?": "Go to the Employee Management section, fill in the necessary details in the Add New Employee form, and click on 'Add Employee'.",
        "How can I view detailed attendance reports?": "Navigate to the Detailed Reports section, apply the desired filters, and the report will be displayed. You can also export the report to CSV or PDF.",
        "What should I do if an employee's data is incorrect?": "In the Employee Management section, select the employee, make the necessary changes in the Edit Employee Info section, and save the changes."
    }
    
    for question, answer in faqs.items():
        with st.expander(question):
            st.write(answer)
    
    # User Guide
    st.subheader("User Guide")
    st.write("""
        Welcome to the Admin Dashboard User Guide. This guide will help you navigate and use the various features of the dashboard effectively.
        
        **Key Sections:**
        - **Overview**: Provides a quick summary of attendance metrics and trends.
        - **Detailed Reports**: Offers in-depth attendance data with filters and export options.
        - **Employee Management**: Allows you to manage employee information, including adding, editing, and removing employees.
        - **Settings**: Customize notifications, working hours, and manage user permissions.
        - **Help & Support**: Access FAQs, this guide, and contact support.

        **How to Use:**
        - Start by logging in with your admin credentials.
        - Use the sidebar to navigate between sections.
        - Each section is designed to be intuitive, with helpful prompts and actions.
        
        **Troubleshooting:**
        - If you encounter issues, first check the FAQ section.
        - If the problem persists, contact support using the form below.

        For more detailed information, refer to the full [User Manual](#).
    """)

    # Contact Support
    st.subheader("Contact Support")
    with st.form("contact_form"):
        name = st.text_input("Your Name")
        email = st.text_input("Your Email")
        issue_type = st.selectbox("Issue Type", ["General Inquiry", "Bug Report", "Feature Request", "Other"])
        message = st.text_area("Message")

        if st.form_submit_button("Submit"):
            if name and email and message:
                # In a real application, this would be where you send the form data to a support email or a ticketing system
                st.success("Thank you for reaching out! We'll get back to you as soon as possible.")
            else:
                st.error("Please fill out all fields before submitting.")

