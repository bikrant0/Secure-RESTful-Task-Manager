from rest_framework.pagination import PageNumberPagination

class TaskPagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = 'page_size'  #Allows frontend to request ?pgae_size=10
    max_page_size = 40 #Hard limit to prevent database abuse
    