from flask import Flask, render_template, request, json
from flask_pymongo import PyMongo
from bson import json_util
import os
from urllib.parse import unquote
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
port = int(os.environ.get("PORT", 5000))
app.config["MONGO_URI"] = os.getenv('MONGO_URI')
mongo = PyMongo(app)

@app.route('/')
def index():
    """Index from Lider webpage."""
    return render_template('index.html')


@app.route('/supermercado/assembler', methods=['POST'])
def search():
    """Get the list of products that contains a specific word.
    Parameters:
        search (str): The keyword to search in DB
        limit (str) - optional: The limit of results
        id_product (str) - optional: The ID of specific product.
    Returns:
        json: if not is an error, return the products in json format. Otherwise, return a 500 status code.
    """
    try:
        search_arg = unquote(request.args.get('search', default=''))
        # TODO: In this example, The app avoid a pagination, so the limit by default is 50.
        limit_arg = request.args.get('limit', default='50')
        id_product_arg = request.args.get('id_product', default='')
        is_palindrome = ((len(search_arg) > 3 or search_arg.isnumeric()) and search_arg == search_arg[::-1])
        products = []
        if search_arg.isnumeric() or id_product_arg:
            search_arg = id_product_arg if id_product_arg else search_arg
            product = mongo.db.products.find_one({"id": int(search_arg)})
            if product:
                if is_palindrome:
                    product['normal_price'] = int(product['price'])
                    product['price'] = int(product['price']/2)
                    product['saving'] = product['normal_price'] - product['price']
                products.append(product)
        if not products:
            filters = {"$or": [{"brand": {"$regex": f'{search_arg}.*', "$options": 'i'}}, {"description": {"$regex": f'{search_arg}.*', "$options": 'i'}}]}
            products_data = mongo.db.products.find(filters).limit(int(limit_arg))

            for product in products_data:
                if is_palindrome:
                    product['normal_price'] = product['price']
                    product['price'] = int(product['price']/2)
                    product['saving'] = product['normal_price'] - product['price']
                products.append(product)
        res_dict = {"products": products, "count": len(products), "discount": is_palindrome}
        return app.response_class(
            response=json.dumps(res_dict, indent=4, default=json_util.default),
            status=200,
            mimetype='application/json'
        )
    except (RuntimeError, TypeError, NameError):
        return app.response_class(status=500)


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=port)
