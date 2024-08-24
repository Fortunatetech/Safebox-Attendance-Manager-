from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import os
import pickle
import gspread
import streamlit as st
from datetime import datetime
import re 
from app_usage import app_usage_documentation

# Define the scope
SCOPES = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive']

# Load credentials from file
creds = None

# Token file stores the user's access and refresh tokens
if os.path.exists('token.pickle'):
    with open('token.pickle', 'rb') as token:
        creds = pickle.load(token)

# If no valid credentials are available, let the user log in
if not creds or not creds.valid:
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
    else:
        flow = InstalledAppFlow.from_client_secrets_file(
            'credentials2.json', SCOPES)
        creds = flow.run_local_server(port=0)
    # Save the credentials for the next run
    with open('token.pickle', 'wb') as token:
        pickle.dump(creds, token)


# Google Sheets API setup
client = gspread.authorize(creds)

# Open the Google Sheet
sheet = client.open("SafeBox_Standard_Attendance_Sheet")
employee_data = sheet.worksheet("Employee Master Data")
attendance_data = sheet.worksheet("Attendance Data")

# Streamlit UI
st.title("Safebox Attendance Manager")

app_usage_documentation()

# Function to check if Worker ID exists
def check_employee_id_exists(employee_id):
    records = employee_data.get_all_records()
    return any(record["Employee ID"] == employee_id for record in records)

# Function to validate Worker ID format
def validate_employee_id_format(employee_id):
    return re.match(r'^sbx\d{3}$', employee_id) is not None

# Function to check if ID is already registered today
def check_id_registered_today(employee_id):
    today_date = datetime.now().strftime("%Y-%m-%d")
    records = attendance_data.get_all_records()
    return any(record["Employee ID"] == employee_id and record["Date"] == today_date for record in records)

# Function to get Employee Name and Department from the Employee Master Data
def get_employee_details(employee_id):
    cell = employee_data.find(employee_id)
    row = employee_data.row_values(cell.row)
    employee_name = row[1] 
    department = row[5]   
    return employee_name, department

# Function to check if Worker ID is already signed out today
def check_id_already_signed_out(employee_id):
    records = attendance_data.get_all_records()
    today = datetime.now().strftime("%Y-%m-%d")
    for record in records:
        if record.get("Employee ID") == employee_id and record.get("Date") == today and record.get("Out-Time") != "":
            return True
    return False

# Column 1: Sign-In
col1, col2 = st.columns(2)

with col1:
    st.header("Sign-In")
    employee_id_in = st.text_input("Enter Employee ID")
    attendance_status1 = st.selectbox("Attendance Status (Sign-In)", ["Early", "Leave", "Holiday", 
                                                                      "Work from Hoome", "Site Work", 
                                                                      "Late(On Official Duty)", 
                                                                      "Tardy(Late Arrival)"])

    if st.button("Submit Sign-In"):
            if employee_id_in:
                if not validate_employee_id_format(employee_id_in):
                    st.error("ID format not supported. Please enter an ID in the format sbxXXX.")
                else:
                    with st.spinner("Verifying ID and Signing In..."):
                        if check_employee_id_exists(employee_id_in):
                            if check_id_registered_today(employee_id_in):
                                st.error("ID already registered for today.")
                            else:

                                # Get employee details
                                employee_name, department = get_employee_details(employee_id_in)  

                                today = datetime.now()
                                date_value = today.strftime("%Y-%m-%d")
                                day_of_week = today.strftime("%A")
                                time_string = today.strftime("%I:%M %p")
                                # Fixed Break Duration
                                break_start = "12:00 PM"
                                break_end = "12:40 PM"

                                # Append data to Attendance sheet
                                row = [
                                    employee_id_in, employee_name, department, date_value, day_of_week, time_string, attendance_status1, break_start, break_end, "", ""   ]
                                attendance_data.append_row(row)
                                st.success("Sign-In recorded successfully!")
                        else:
                            st.error("Worker ID not found in Employee Master Data.")
            else:
                st.error("Please enter a Worker ID.")

# Column 2: Sign-Out
with col2:
    st.header("Sign-Out")
    employee_id_out = st.text_input("Enter Employee ID (Sign-Out)")
    attendance_status2 = st.selectbox("Attendance Status (Sign-Out)", ["On Time", "Left Early", 
                                                                       "Early(On Official Duty)" ])                                                                      
                                                                      
    if st.button("Submit Sign-Out"):
        if employee_id_out:
            if not validate_employee_id_format(employee_id_out):
                st.error("ID format not supported. Please enter an ID in the format sbxXXX.")
            else:
                with st.spinner("Verifying ID..."):
                    if check_employee_id_exists(employee_id_out):
                        if check_id_already_signed_out(employee_id_out):
                            st.error("You have already signed out today.")
                        else:
                            # Find the most recent sign-in entry for the worker
                            records = attendance_data.get_all_records()
                            found = False
                            for i in range(len(records)-1, -1, -1):
                                if records[i]["Employee ID"] == employee_id_out and records[i]["Out-Time"] == "":
                                    found = True
                                    out_time = datetime.now().strftime("%I:%M %p")

                                    # Update the "Out-Time" and "Attendance Status 2" columns
                                    attendance_data.update_cell(i+2, 10, out_time)  # Update Out-Time
                                    attendance_data.update_cell(i+2, 11, attendance_status2)  

                                    st.success("Sign-Out recorded successfully!")
                                    break

                            if not found:
                                st.error("Sign-In record not found for today.")
                    else:
                        st.error("Worker ID not found in Employee Master Data.")
        else:
            st.error("Please enter a Worker ID.")


