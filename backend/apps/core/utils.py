import csv
from io import StringIO

from django.http import HttpResponse


def export_rows_as_csv(filename: str, headers: list[str], rows: list[list]):
    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = f'attachment; filename="{filename}"'
    writer = csv.writer(response)
    writer.writerow(headers)
    writer.writerows(rows)
    return response


def parse_csv_file(uploaded_file):
    decoded = uploaded_file.read().decode("utf-8")
    reader = csv.DictReader(StringIO(decoded))
    return list(reader)
