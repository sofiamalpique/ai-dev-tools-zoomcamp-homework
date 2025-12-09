from datetime import date

from django.test import TestCase
from django.urls import reverse

from .models import Todo


class TodoModelTests(TestCase):
    def test_defaults_and_string_representation(self):
        todo = Todo.objects.create(title="Write tests")
        self.assertFalse(todo.resolved)
        self.assertEqual(str(todo), "Write tests")

    def test_open_tasks_come_before_resolved(self):
        open_task = Todo.objects.create(title="Open task")
        done_task = Todo.objects.create(title="Done task", resolved=True)

        todos = list(Todo.objects.all())

        self.assertEqual(todos[0], open_task)
        self.assertEqual(todos[-1], done_task)


class TodoViewTests(TestCase):
    def setUp(self):
        self.todo = Todo.objects.create(
            title="Existing task",
            description="Already here",
            due_date=date(2025, 1, 1),
        )

    def test_home_renders_and_lists_todos(self):
        response = self.client.get(reverse("home"))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, self.todo.title)

    def test_create_todo_from_home_post(self):
        response = self.client.post(
            reverse("home"),
            {
                "title": "New task",
                "description": "Added from test",
                "due_date": "2025-02-01",
            },
            follow=True,
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Todo.objects.count(), 2)
        created = Todo.objects.latest("id")
        self.assertEqual(created.title, "New task")
        self.assertFalse(created.resolved)

    def test_edit_todo_updates_fields(self):
        response = self.client.post(
            reverse("todo_edit", args=[self.todo.pk]),
            {
                "title": "Updated task",
                "description": "Updated desc",
                "due_date": "2025-03-01",
                "resolved": "on",
            },
            follow=True,
        )
        self.assertEqual(response.status_code, 200)
        self.todo.refresh_from_db()
        self.assertEqual(self.todo.title, "Updated task")
        self.assertTrue(self.todo.resolved)
        self.assertEqual(self.todo.due_date, date(2025, 3, 1))

    def test_toggle_resolved_flips_status(self):
        self.assertFalse(self.todo.resolved)
        response = self.client.post(reverse("todo_toggle", args=[self.todo.pk]), follow=True)
        self.assertEqual(response.status_code, 200)
        self.todo.refresh_from_db()
        self.assertTrue(self.todo.resolved)

    def test_delete_todo_removes_record(self):
        response = self.client.post(reverse("todo_delete", args=[self.todo.pk]), follow=True)
        self.assertEqual(response.status_code, 200)
        self.assertFalse(Todo.objects.filter(pk=self.todo.pk).exists())
