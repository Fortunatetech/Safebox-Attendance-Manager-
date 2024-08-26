import streamlit as st
import time

# Set page configuration 
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
    st.sidebar.title("Admin Navigation Bar")
    page = st.sidebar.selectbox("Go to", ["Overview", "Detailed Reports", "Employee Management", "Settings", "Help"])
    if page == "Overview":
        st.write("Overview content goes here.")
    elif page == "Detailed Reports":
        st.write("Detailed Reports content goes here.")
    elif page == "Employee Management":
        st.write("Employee Management content goes here.")
    elif page == "Settings":
        st.write("Settings content goes here.")
    elif page == "Help":
        st.write("Help content goes here.")
if st.session_state['logged_in']:
    dashboard_layout()
else:
    admin_login()

