import gspread
import os
import pickle
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
import pandas as pd

# Define the scope
SCOPES = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive']

def data_ingestion():
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
            flow = InstalledAppFlow.from_client_secrets_file('credentials2.json', SCOPES)
            creds = flow.run_local_server(port=0)

        # Save the credentials for the next run
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)

    # Google Sheets API setup
    client = gspread.authorize(creds)

    sheet = client.open("SafeBox_Standard_Attendance_Sheet")
    employee_data = sheet.worksheet("Employee Master Data")
    attendance_data = sheet.worksheet("Attendance Data")

    # Fetch all records
    employee_records = employee_data.get_all_records()
    attendance_records = attendance_data.get_all_records()

    employee_df = pd.DataFrame(employee_records)
    attendance_df = pd.DataFrame(attendance_records)

    return  employee_df, attendance_df
