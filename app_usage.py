import streamlit as st

def app_usage_documentation():

    # Sidebar Instructions
    st.sidebar.title("How to Use the Safebox Attendance Manager")

    st.sidebar.subheader("Welcome to the Safebox Attendance Manager!")

    st.sidebar.markdown("""
    Follow these simple steps to manage attendance:

    ### **1. Sign-In:**
    - **Enter Your Employee ID:** Type in your Employee ID in the provided field. Ensure the ID is in the format `sbxXXX` (e.g., `sbx001`).
    - **Select Attendance Status:** Choose your attendance status from the dropdown menu. Options include "Early," "Leave," (Leave covers Casualties, Sickness etc), "Holiday," etc.
    - **Submit:** Click the "Submit Sign-In" button to record your sign-in. 
    - If your ID is not recognized, you'll be prompted to check the ID format or registration.
    - You will see a confirmation message once your sign-in is successful.

    ### **2. Sign-Out:**
    - **Enter Employee ID (Sign-Out):** Type in the same Employee ID you used for sign-in.
    - **Select Attendance Status (Sign-Out):** Choose your sign-out status from the dropdown menu. Options include "On Time," "Left Early," "Early (On Official Duty)," etc.
    - **Submit:** Click the "Submit Sign-Out" button to record your sign-out.
    - If you haven't signed in or if you are trying to sign out more than once, you'll receive an error message.
    - Once your sign-out is recorded, you'll see a success message or a notification if you have already signed out for the day.

    ### **Important Notes:**
    - **Format:** Ensure your Employee ID is correctly formatted (`sbxXXX`). Incorrect formats will be rejected.
    - **Verification:** IDs are verified against the Employee Master Data. Make sure your ID is registered.
    - **Daily Records:** You can sign in and out only once per day. Multiple sign-outs for the same day are not allowed.

    If you encounter any issues, please contact the system administrator for assistance.

    Enjoy managing your attendance!
    """)