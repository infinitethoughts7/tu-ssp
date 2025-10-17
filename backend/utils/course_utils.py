# Course duration mapping utility
from .constants import COURSE_CHOICES

# Define course duration mapping based on the constants
COURSE_DURATION_MAPPING = {
    # 2-Year Programs
    "M.A. (Economics)": 2,
    "M.A. (English)": 2,
    "M.A. (Hindi)": 2,
    "M.A. (Mass Communication)": 2,
    "M.A. (Public Administration)": 2,
    "M.A. (Telugu Studies)": 2,
    "M.A. (Telugu Studies - Comparative Literature)": 2,
    "M.A. (Urdu)": 2,
    "M.A. (History)": 2,
    "M.A. (Political Science)": 2,
    "M.Com. (e-Commerce)": 2,
    "M.Com. (General)": 2,
    "M.S.W": 2,
    "M.Sc. (Applied Statistics)": 2,
    "M.Sc. (Bio-Technology)": 2,
    "M.Sc. (Botany)": 2,
    "M.Sc. (Chemistry - 2 Years Course in specialization with Organic Chemistry)": 2,
    "M.Sc. (Chemistry - 2 Years with specialization in Pharmaceutical Chemistry)": 2,
    "M.Sc. (Computer Science)": 2,
    "M.Sc. (Food Science & Technology)": 2,
    "M.Sc. (Geo Informatics)": 2,
    "M.Sc. (Mathematics)": 2,
    "M.Sc. (Nutrition & Dietetics)": 2,
    "M.Sc. (Physics)": 2,
    "M.Sc. (Physics - 2 Years with specialization in Electronics)": 2,
    "M.Sc. (Statistics)": 2,
    "M.Sc. (Zoology)": 2,
    "M.B.A": 2,
    "M.C.A": 2,
    "LL.M (2 Years)": 2,
    "M.Ed.": 2,
    
    # 3-Year Programs
    "LL.B (3 Years)": 3,
    
    # 5-Year Programs
    "M.A. (Applied Economics - 5 Years)": 5,
    "M.Sc. (Chemistry - 5 Years Integrated with specialization in Pharmaceutical Chemistry)": 5,
    "IMBA (Integrated Master of Business Management) (5 Yrs Integrated)": 5,
    
    # Other Programs (Default to 2 years for unspecified)
    "B.Lib.Sc": 2,
    "B.Ed.": 2,
    "B.P.Ed.": 2,
    "BCA": 2,
}

def get_course_duration(course_name):
    """
    Get the duration of a course in years.
    
    Args:
        course_name (str): The name of the course
        
    Returns:
        int: Duration in years (defaults to 2 if not found)
    """
    if not course_name:
        return 2
    return COURSE_DURATION_MAPPING.get(course_name, 2)

def get_relevant_years_for_course(course_name):
    """
    Get the relevant years for a course based on its duration.
    
    Args:
        course_name (str): The name of the course
        
    Returns:
        list: List of relevant years (e.g., [1, 2] for 2-year course)
    """
    duration = get_course_duration(course_name)
    return list(range(1, duration + 1)) 