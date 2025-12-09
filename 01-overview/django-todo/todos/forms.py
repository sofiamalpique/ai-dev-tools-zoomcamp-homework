from django import forms

from .models import Todo


class TodoForm(forms.ModelForm):
    due_date = forms.DateField(
        required=False,
        widget=forms.DateInput(attrs={"type": "date"}),
    )

    class Meta:
        model = Todo
        fields = ["title", "description", "due_date", "resolved"]
        widgets = {
            "title": forms.TextInput(attrs={"placeholder": "What needs to be done?"}),
            "description": forms.Textarea(
                attrs={"rows": 3, "placeholder": "Add details (optional)"}
            ),
        }
