from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_POST

from .forms import TodoForm
from .models import Todo


def home(request):
    todos = Todo.objects.all()
    form = TodoForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        form.save()
        return redirect("home")

    return render(request, "home.html", {"form": form, "todos": todos})


def edit_todo(request, pk):
    todo = get_object_or_404(Todo, pk=pk)
    if request.method == "POST":
        form = TodoForm(request.POST, instance=todo)
        if form.is_valid():
            form.save()
            return redirect("home")
    else:
        form = TodoForm(instance=todo)

    return render(request, "edit_todo.html", {"form": form, "todo": todo})


@require_POST
def toggle_resolved(request, pk):
    todo = get_object_or_404(Todo, pk=pk)
    todo.resolved = not todo.resolved
    todo.save(update_fields=["resolved", "updated_at"])
    return redirect("home")


@require_POST
def delete_todo(request, pk):
    todo = get_object_or_404(Todo, pk=pk)
    todo.delete()
    return redirect("home")
