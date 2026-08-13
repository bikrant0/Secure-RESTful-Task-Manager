from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticated
from .permissions import IsOwner
from .models import Task
from .serializers import TaskSerializer, NoteSerializer
from .pagination import TaskPagination
from django.shortcuts import render, get_object_or_404
from django.db.models import Q


class TaskListCreateView(generics.ListCreateAPIView):
    
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Task.objects.filter(
            Q(user=self.request.user) | Q(assignee = self.request.user)
            ).distinct()
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        
    pagination_class = TaskPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description', 'status']
    
        

class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)
    

class NoteCreateView(generics.CreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        task_id = self.kwargs.get('task_id')
        task = get_object_or_404(Task, id=task_id, user=self.request.user)
        serializer.save(task=task)
        
def frontend_page(request):
    return render(request, "index.html")

def dashboard_page(request):
    return render(request, "dashboard.html")