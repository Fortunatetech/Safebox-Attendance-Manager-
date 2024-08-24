import streamlit as st
import gspread
import pandas as pd
import matplotlib.pyplot as plt
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import os
import pickle

# Function to check admin login credentials
def check_login(username, password):
    ADMIN_USERNAME = "admin"
    ADMIN_PASSWORD = "password123"
    return username == ADMIN_USERNAME and password == ADMIN_PASSWORD

# Function to load data from Google Sheets
def load_data():
    # Google Sheets API setup
    SCOPES = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive']
    creds = None

    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file('credentials2.json', SCOPES)
            creds = flow.run_local_server(port=0)
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)

    client = gspread.authorize(creds)

    # Open the Google Sheet
    sheet = client.open("SafeBox_Standard_Attendance_Sheet")
    attendance_data = sheet.worksheet("Attendance Data")
    
    # Fetch the data into a DataFrame
    data = attendance_data.get_all_records()
    df = pd.DataFrame(data)
    
    return df

# Function to display the dashboard after successful login
def show_dashboard():
    st.title("Admin Dashboard")

    # Load data from Google Sheets
    df = load_data()

    # Sidebar for filtering
    st.sidebar.header("Filter Data")
    selected_date_range = st.sidebar.date_input("Select Date Range", [])
    selected_department = st.sidebar.selectbox("Select Department", ["All"] + df['Department'].unique().tolist())
    selected_status = st.sidebar.multiselect("Select Attendance Status", df['Attendance Status In'].unique().tolist())

    # Apply Filters
    if selected_date_range:
        df = df[df['Date'].between(str(selected_date_range[0]), str(selected_date_range[1]))]
    if selected_department != "All":
        df = df[df['Department'] == selected_department]
    if selected_status:
        df = df[df['Attendance Status In'].isin(selected_status)]

    # Display Key Metrics
    st.header("Key Metrics")
    total_employees = len(df)
    total_present = len(df[df['Attendance Status In'] == 'Present'])
    total_absent = len(df[df['Attendance Status In'] == 'Absent'])
    st.metric(label="Total Employees", value=total_employees)
    st.metric(label="Present Today", value=total_present)
    st.metric(label="Absent Today", value=total_absent)

    # Display Charts
    st.header("Attendance Analysis")
    attendance_status_counts = df['Attendance Status In'].value_counts()

    fig, ax = plt.subplots()
    attendance_status_counts.plot(kind='bar', ax=ax)
    ax.set_title('Attendance Status Distribution')
    ax.set_xlabel('Status')
    ax.set_ylabel('Count')
    st.pyplot(fig)

    # Display Data Table
    st.header("Attendance Data")
    st.dataframe(df)

# Main function to run the app
def main():
    st.title("Admin Login")

    # Admin login form
    with st.form(key='login_form'):
        username = st.text_input("Username")
        password = st.text_input("Password", type="password")
        submit_button = st.form_submit_button(label='Login')

    # Handle login form submission
    if submit_button:
        if check_login(username, password):
            st.success("Login successful! Redirecting to the dashboard...")
            show_dashboard()
        else:
            st.error("Invalid username or password. Please try again.")

if __name__ == "__main__":
    main()
