window.onload = function(){
    jQuery('a').attr('href','#').click(function(){
        jQuery('#modalLinkNotAvailable').modal('show');
    });
};

function showResults(keyword,product_id){
    let searchTerm = $.trim(keyword);
    let contentCollection = '/content/Shared/Auto-Suggest Panels';
    let url = contextPath + '/assembler' + "?assemblerContentCollection=" +
        contentCollection + "&format=json&Dy=1&search=" + encodeURIComponent(searchTerm);
    if(typeof(product_id)!=='undefined'){
        url=url+'&id_product='+product_id;
    }
    let mainContent="";
    $('.searchbox-overlay').remove();
    $('#quickcartbuscador').removeClass('show');
    $('#autoSuggest_level1').html('');
    // Limitar la bùsqueda por sobre 3 caracteres (Reglas enviadas por email)
    if(searchTerm.length<=3 && !(/^\+?\d+$/.test(searchTerm))){
        $('#autoSuggest_level1').html('<');
        return false;
    }
    let ajS1 = $.ajax({type: "post", url: url, dataType: 'json', async: true});
    $.when(ajS1).then(function (data) {
        mainContent=mainContent.concat('<h1 class="catalogo-title">Estás buscando "'+keyword+'"</h1>');
        if(data!=undefined && typeof(data.products) !== 'undefined' && data.products.length){
            let discount_class=(data.discount)?'palindromeClass':'';
            mainContent=mainContent.concat('<div class="grid-of-five clearfix box-products-list '+discount_class+'"></div>');
            $('#main-content').html(mainContent);
            $.each(data.products, function (key,searchValue) {
                    $templateProduct = $("#product_example").clone().attr('id', 'product_example_'+searchValue.id).show();
                    $(".product-image", $templateProduct).attr('src','http://'+searchValue.image).attr('title',searchValue.brand);
                    $(".product-brand", $templateProduct).html(searchValue.brand);
                    $(".title", $templateProduct).html(searchValue.description);
                    $(".sale-price", $templateProduct).html('$'+parseInt(searchValue.price).toLocaleString());
                    $(".normal-price span", $templateProduct).html('$'+parseInt(searchValue.normal_price).toLocaleString());
                    $(".saving span", $templateProduct).html('$'+parseInt(searchValue.saving).toLocaleString());
                    $templateProduct.appendTo("#main-content > .box-products-list");
            });
        }else{
            $templateProductNotFound = $("#product-not-found-example").clone().attr('id', 'product_not_found').show();
            $('#main-content').html($templateProductNotFound.html());
        }
    });
}