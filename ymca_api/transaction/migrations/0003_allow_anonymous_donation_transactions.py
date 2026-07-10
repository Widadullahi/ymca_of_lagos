import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("transaction", "0002_add_payment_gateway_to_transaction"),
    ]

    operations = [
        migrations.AlterField(
            model_name="transaction",
            name="user",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                to="account.user",
            ),
        ),
    ]
