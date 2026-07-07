# Generated manually to fix phone number field
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("account", "0022_emailverification"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="phone_number",
            field=models.CharField(max_length=15, null=True, blank=True),
        ),
    ]
