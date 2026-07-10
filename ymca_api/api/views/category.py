from rest_framework import generics

from account.models import Category, Church, YouthGroup
from api.serializers.category import CategorySerializer, ChurchSerializer, YouthGroupSerializer
from api.utils.response.response_format import bad_request_response, success_response
from api.utils.permissions import IsAppAdmin



class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    

    def get(self, request, *args, **kwargs):
        serializers = self.serializer_class(
            self.get_queryset(), many=True)
        
        return success_response(data=serializers.data)
    



class ChurchListView(generics.ListAPIView):
    queryset = Church.objects.all()
    serializer_class = ChurchSerializer

    def get(self, request, *args, **kwargs):
        serializers = self.serializer_class(
            self.get_queryset(), many=True)
        return success_response(data=serializers.data)


class AdminChurchListCreateView(generics.GenericAPIView):
    queryset = Church.objects.all().order_by('name')
    serializer_class = ChurchSerializer
    permission_classes = [IsAppAdmin]

    def get(self, request, *args, **kwargs):
        serializer = self.serializer_class(self.get_queryset(), many=True)
        return success_response(data=serializer.data)

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        name = serializer.validated_data['name'].strip()
        if Church.objects.filter(name__iexact=name).exists():
            return bad_request_response(message='A church with this name already exists')

        church = Church.objects.create(name=name)
        return success_response(
            message='Church added successfully',
            data=self.serializer_class(church).data,
        )


class AdminChurchDetailView(generics.GenericAPIView):
    queryset = Church.objects.all()
    serializer_class = ChurchSerializer
    permission_classes = [IsAppAdmin]
    lookup_field = 'id'

    def get_object(self):
        return generics.get_object_or_404(self.get_queryset(), id=self.kwargs.get('id'))

    def patch(self, request, *args, **kwargs):
        church = self.get_object()
        serializer = self.serializer_class(church, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        new_name = serializer.validated_data.get('name', church.name).strip()
        if Church.objects.filter(name__iexact=new_name).exclude(id=church.id).exists():
            return bad_request_response(message='A church with this name already exists')

        church.name = new_name
        church.save(update_fields=['name', 'updated_at'])

        return success_response(
            message='Church updated successfully',
            data=self.serializer_class(church).data,
        )

    def delete(self, request, *args, **kwargs):
        church = self.get_object()
        church_name = church.name
        church.delete()
        return success_response(message=f'{church_name} deleted successfully')
    



class YouthGroupListView(generics.ListAPIView):
    queryset = YouthGroup.objects.all()
    serializer_class = YouthGroupSerializer

    def get(self, request, *args, **kwargs):
        serializers = self.serializer_class(
            self.get_queryset(), many=True)
        return success_response(data=serializers.data)
