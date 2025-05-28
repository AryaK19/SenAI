import re

def validate_email(email):
    """Validate email format"""
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return bool(re.match(pattern, email))

def validate_password_strength(password):
    """
    Validate password strength
    Requirements:
    - At least 8 characters
    - Contains uppercase and lowercase
    - Contains at least one number
    """
    if len(password) < 8:
        return False
    if not re.search(r'[A-Z]', password):
        return False
    if not re.search(r'[a-z]', password):
        return False
    if not re.search(r'[0-9]', password):
        return False
    return True

def send_email(recipient, subject, body):
    """Email utility function (placeholder)"""
    # Implement with your preferred email service
    print(f"Would send email to {recipient}: {subject}")