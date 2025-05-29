from django.core.management.base import BaseCommand
from dues.models import FeeStructure

class Command(BaseCommand):
    help = 'Populate FeeStructure table with official fee data for all PG courses (2022-23)'

    def handle(self, *args, **kwargs):
        courses = [
            {"course_name": "M.A. (Applied Economics - 5 Years)", "category": "University Main Campus", "tuition_fee": 13010, "special_fee": 2000, "other_fee": 0, "exam_fee": 1620},
            {"course_name": "M.A. (Economics)", "category": "University Main Campus", "tuition_fee": 13010, "special_fee": 2000, "other_fee": 0, "exam_fee": 1620},
            {"course_name": "M.A. (English)", "category": "University Main Campus", "tuition_fee": 13010, "special_fee": 2000, "other_fee": 0, "exam_fee": 1620},
            {"course_name": "M.A. (Hindi)", "category": "University Main Campus", "tuition_fee": 13010, "special_fee": 2000, "other_fee": 0, "exam_fee": 1620},
            {"course_name": "M.A. (Mass Communication)", "category": "University Main Campus", "tuition_fee": 9910, "special_fee": 2000, "other_fee": 0, "exam_fee": 1620},
            {"course_name": "M.A. (Public Administration)", "category": "University Main Campus", "tuition_fee": 13010, "special_fee": 2000, "other_fee": 0, "exam_fee": 1620},
            {"course_name": "M.A. (Telugu Studies)", "category": "University Main Campus", "tuition_fee": 13010, "special_fee": 2000, "other_fee": 0, "exam_fee": 1620},
            {"course_name": "M.A. (Urdu)", "category": "University Main Campus", "tuition_fee": 13010, "special_fee": 2000, "other_fee": 0, "exam_fee": 1620},
            {"course_name": "M.Com. (e-Commerce)", "category": "University Main Campus", "tuition_fee": 19010, "special_fee": 2000, "other_fee": 0, "exam_fee": 3340},
            {"course_name": "M.Sc. (Applied Statistics)", "category": "University Main Campus", "tuition_fee": 19500, "special_fee": 2000, "other_fee": 0, "exam_fee": 1620},
            {"course_name": "M.Sc. (Bio-Technology)", "category": "University Main Campus", "tuition_fee": 19500, "special_fee": 2000, "other_fee": 0, "exam_fee": 3340},
            {"course_name": "M.Sc. (Botany)", "category": "University Main Campus", "tuition_fee": 19500, "special_fee": 2000, "other_fee": 0, "exam_fee": 1620},
            {"course_name": "M.Sc. (Mathematics)", "category": "University Main Campus", "tuition_fee": 19500, "special_fee": 2000, "other_fee": 0, "exam_fee": 1620},
            {"course_name": "M.Sc. (Chemistry - 2 Years Course in specialization with Organic Chemistry)", "category": "University Main Campus", "tuition_fee": 19500, "special_fee": 2000, "other_fee": 0, "exam_fee": 1620},
            {"course_name": "M.Sc. (Chemistry - 2 Years with specialization in Pharmaceutical Chemistry)", "category": "University Main Campus", "tuition_fee": 19500, "special_fee": 2000, "other_fee": 0, "exam_fee": 1620},
            {"course_name": "M.Sc. (Chemistry - 5 Years Integrated with specialization in Pharmaceutical Chemistry)", "category": "University Main Campus", "tuition_fee": 19500, "special_fee": 2000, "other_fee": 0, "exam_fee": 1620},
            {"course_name": "IMBA (Integrated Master of Business Management) (5 Yrs Integrated)", "category": "University Main Campus", "tuition_fee": 20000, "special_fee": 2000, "other_fee": 0, "exam_fee": 4700},
            {"course_name": "M.B.A", "category": "University Main Campus", "tuition_fee": 10000, "special_fee": 2000, "other_fee": 650, "exam_fee": 2270},
            {"course_name": "M.C.A", "category": "University Main Campus", "tuition_fee": 12500, "special_fee": 2000, "other_fee": 650, "exam_fee": 2220},
            {"course_name": "LL.B (3 Years)", "category": "University Main Campus", "tuition_fee": 12000, "special_fee": 2000, "other_fee": 0, "exam_fee": 1670},
            {"course_name": "LL.M (2 Years)", "category": "University Main Campus", "tuition_fee": 12000, "special_fee": 2000, "other_fee": 0, "exam_fee": 1670},
            {"course_name": "M.A. (History)", "category": "University South Campus", "tuition_fee": 13010, "special_fee": 2000, "other_fee": 0, "exam_fee": 1620},
            {"course_name": "M.A. (Political Science)", "category": "University South Campus", "tuition_fee": 13010, "special_fee": 2000, "other_fee": 0, "exam_fee": 1620},
            {"course_name": "M.A. (Telugu Studies - Comparative Literature)", "category": "University South Campus", "tuition_fee": 13010, "special_fee": 2000, "other_fee": 0, "exam_fee": 1620},
            {"course_name": "M.S.W", "category": "University South Campus", "tuition_fee": 24010, "special_fee": 2000, "other_fee": 0, "exam_fee": 2760},
        ]

        for course in courses:
            obj, created = FeeStructure.objects.update_or_create(
                course_name=course["course_name"],
                academic_year="2022-23",
                category=course["category"],
                defaults={
                    "tuition_fee": course["tuition_fee"],
                    "special_fee": course["special_fee"],
                    "other_fee": course["other_fee"],
                    "exam_fee": course["exam_fee"],
                }
            )
            if created:
                self.stdout.write(f"✅ Created FeeStructure for {course['course_name']} ({course['category']})")
            else:
                self.stdout.write(f"ℹ️ Updated FeeStructure for {course['course_name']} ({course['category']})")

        self.stdout.write(self.style.SUCCESS('Successfully populated FeeStructure table for 2022-23'))

        existing = FeeStructure.objects.filter(academic_year='2022-23')
        count = 0
        for fs in existing:
            # Check if already exists to avoid duplicates
            if not FeeStructure.objects.filter(course_name=fs.course_name, academic_year='2023-24', category=fs.category).exists():
                FeeStructure.objects.create(
                    course_name=fs.course_name,
                    academic_year='2023-24',
                    category=fs.category,
                    tuition_fee=fs.tuition_fee,
                    special_fee=fs.special_fee,
                    other_fee=fs.other_fee,
                    exam_fee=fs.exam_fee
                )
                count += 1
        self.stdout.write(self.style.SUCCESS(f'Duplicated {count} FeeStructure entries for 2023-24.')) 