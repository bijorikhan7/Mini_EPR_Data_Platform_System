from django.contrib.auth import get_user_model

User = get_user_model()


class AccountService:
    @staticmethod
    def get_user_profile(user_id):
        return User.objects.select_related("factory").get(id=user_id)
