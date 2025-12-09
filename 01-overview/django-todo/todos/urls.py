from django.urls import path

from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("todos/<int:pk>/edit/", views.edit_todo, name="todo_edit"),
    path("todos/<int:pk>/toggle/", views.toggle_resolved, name="todo_toggle"),
    path("todos/<int:pk>/delete/", views.delete_todo, name="todo_delete"),
]
