from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticated
from .permissions import IsOwner
from .models import Task
from .serializers import TaskSerializer, NoteSerializer
from .pagination import TaskPagination
from django.shortcuts import render



class TaskListCreateView(generics.ListCreateAPIView):
    
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Task.objects.filter(user=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        
    pagination_class = TaskPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description', 'status']
    
        

class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, IsOwner]
    

class NoteCreateView(generics.CreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        task_id = self.kwargs.get('task_id')
        task = Task.objects.get(Task, id=task_id,user=self.request.user)
        serializer.save(task=task)
        
def serve_frontend(request):
    return render(request, "index.html")