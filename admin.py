import streamlit as st
import time
from data_ingestion import data_ingestion
from helper_function import show_overview
from helper_function import detailed_reports
from helper_function import employee_management
from helper_function import settings
from helper_function import help_and_support

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
        employee_management()
    elif page == "Settings":
        settings()
    elif page == "Help":
        help_and_support()

if st.session_state['logged_in']:
    dashboard_layout()
else:
    admin_login()

