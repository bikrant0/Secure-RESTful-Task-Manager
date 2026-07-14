from django.urls import path
from .views import TaskListCreateView, TaskDetailView, NoteCreateView

urlpatterns = [
    path('', TaskListCreateView.as_view(), name='task-list'),
    path('tasks/<int:pk>/', TaskDetailView.as_view(), name='task-detail'),
    path('tasks/<int:task_id>/notes/', NoteCreateView.as_view(), name='note-create'),
]
