import json
from unittest import TestCase, mock
from code import app
from mockupdb import MockupDB


class Test(TestCase):

    def setUp(self):
        self.app = app.app.test_client()
        self.server = MockupDB(auto_ismaster=True)
        self.server.run()

    def tearDown(self):
        self.server.stop()

    def test_index(self):
        response = self.app.get('/')
        assert response.status_code == 200

    def test_search_method_not_allowed(self):
        response = self.app.get('/supermercado/assembler')
        assert response.status_code == 405

    def test_search_is_number(self):
        product_id = 181
        response = self.app.post('/supermercado/assembler?search='+str(product_id))
        response_json = json.loads(response.data)
        if app.mongo.db.products.find_one({"id": product_id}):
            assert response_json['count'] == 1
            assert response_json['products'][0]['id'] == product_id
        else:
            assert response_json['count'] == 0

    def test_search_is_palindrome(self):
        response = self.app.post('/supermercado/assembler?search=daad')
        response_json = json.loads(response.data)
        assert response_json['discount'] == True

    def test_search_is_not_palindrome(self):
        response = self.app.post('/supermercado/assembler?search=daads')
        response_json = json.loads(response.data)
        assert response_json['discount'] == False

    def test_search_is_palindrome_but_less_4_characters(self):
        response = self.app.post('/supermercado/assembler?search=dad')
        response_json = json.loads(response.data)
        assert response_json['discount'] == False
