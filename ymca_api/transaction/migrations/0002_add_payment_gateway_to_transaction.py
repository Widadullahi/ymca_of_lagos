import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("transaction", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="transaction",
            name="payment_gateway",
            field=models.CharField(
                choices=[
                    ("paystack", "Paystack"),
                    ("remita", "remita"),
                    ("stripe", "Stripe"),
                    ("flutterwave", "Flutterwave"),
                    ("other", "Other"),
                ],
                default="other",
                max_length=20,
            ),
        ),
    ]

