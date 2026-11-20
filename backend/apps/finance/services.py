from datetime import date
from decimal import Decimal

from django.db.models import Sum

from .models import Transaction


class FinanceService:
    @staticmethod
    def create_income(factory, amount, tx_date=None):
        return Transaction.objects.create(factory=factory, type="income", amount=amount, date=tx_date or date.today())

    @staticmethod
    def create_expense(factory, amount, tx_date=None):
        return Transaction.objects.create(factory=factory, type="expense", amount=amount, date=tx_date or date.today())

    @staticmethod
    def calculate_financial_summary(factory):
        totals = (
            Transaction.objects.filter(factory=factory)
            .values("type")
            .annotate(total=Sum("amount"))
        )
        income = Decimal("0")
        expense = Decimal("0") 
        for item in totals:
            if item["type"] == "income":
                income = item["total"] or Decimal("0")
            if item["type"] == "expense":
                expense = item["total"] or Decimal("0")
        return {"total_income": income, "total_expense": expense, "profit_loss": income - expense}
