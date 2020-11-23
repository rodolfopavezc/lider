var typingTimer;
var doneTypingInterval = 300;
var rrProductSearchIds = "";
var minInputLength = parseInt($("#minAutoSuggestInputLength").val());
var accent_map = {'Ã¡': 'a', 'Ã©': 'e', 'Ã­': 'i', 'Ã³': 'o', 'Ãº': 'u', 'Ã„': 'A', 'Ã–': 'O', 'Ãœ': 'U'};

function accent_fold(str) {
    if (!str) {
        return '';
    }
    var ret = '';
    for (var i = 0; i < str.length; i++) {
        ret += accent_map[str.charAt(i)] || str.charAt(i);
    }
    return ret.toLowerCase();
};$('#searchtextinput').on('propertychange input', function (e) {
    clearTimeout(typingTimer);
    $('.js-backspace').show();
    var searchTerm = $.trim($('#searchtextinput').val());
    if (searchTerm.length >= minInputLength) {
        var keyPressed = e.which;
        if (keyPressed != 37 && keyPressed != 38 && keyPressed != 39 && keyPressed != 40) {
            if (Modernizr.ie8) {
                $('.buscador').css('left', $('.search-field').offset().left);
            }
            typingTimer = setTimeout(function () {
                autoSuggest('searchtextinput')
            }, doneTypingInterval);
        }
    }
    if ($('#searchtextinput').val() == "") {
        $('.js-backspace').hide();
        clearSearchKeyword();
    }
});
$('.js-backspace').on('click', function (e) {
    $('#searchtextinput').val('');
    $('#searchtextinput').focus();
    $('.js-backspace').hide();
    $('#quickcartbuscador').removeClass('show');
    clearSearchKeyword();
});
$('#searchmobiletextinputCustom').on('input', function (e) {
    $('#searchtextinput').val(this.value);
    clearTimeout(typingTimer);
    var searchTerm = $.trim($('#searchmobiletextinputCustom').val());
    if (searchTerm.length >= minInputLength) {
        var keyPressed = e.which;
        if (keyPressed != 37 && keyPressed != 38 && keyPressed != 39 && keyPressed != 40) {
            typingTimer = setTimeout(function () {
                autoSuggest('searchmobiletextinputCustom')
            }, doneTypingInterval);
            searchTTop();
        }
    }
    if ($('#searchmobiletextinputCustom').val() == "") {
        clearSearchKeyword();
    }
});
$('.js-backspace-mobile').on('click', function (e) {
    $('#searchmobiletextinputCustom').val('');
    $('.js-backspace-mobile').hide();
    $('#quickcartbuscador').removeClass('show');
});

function autoSuggest(inputId) {
    var searchTerm = $.trim($('#' + inputId).val());
    var contentCollection = '/content/Shared/Auto-Suggest Panels';
    var url = contextPath + '/assembler' + "?assemblerContentCollection=" +
        contentCollection + "&format=json&Dy=1&limit=5&search=" + encodeURIComponent(searchTerm);
    var productHTML="";
    // Limitar la bùsqueda por sobre 3 caracteres (Reglas enviadas por email)
    if(searchTerm.length<=3 && !(/^\+?\d+$/.test(searchTerm))){
        $('#autoSuggest_level1').html('<h3>Debe ingresar al menos 4 caracteres</h3>');
        if(searchTerm.length===0){
            $('#autoSuggest_level1').html('');
            $('#autoSuggest_level1').html('');
            $('.searchbox-overlay').remove();
        }
        return false;
    }
    $('#quickcartbuscador').removeClass('show');
    $(".clear-search-btn").html('<a href="javascript:;" class="clear-search-keyword">&times;</a>');
    $('#tab-1').html('');
    var ajS1 = $.ajax({type: "post", url: url, dataType: 'json', async: true});
    $.when(ajS1).then(function (data) {
        if(data!=undefined && typeof(data.products) !== 'undefined' && data.products.length){
            $.each(data.products, function (key,searchValue) {
                   productHTML = productHTML.concat('<li><a href="#" onclick="return false;" product_id="'+searchValue.id+'">'+searchValue.brand+' - '+searchValue.description+'</a></li>');
            });
            productHTML='<h2>Productos Sugeridos:</h2><ul class="nav nav-pills departments">'+productHTML+'</ul>';
            $('#autoSuggest_level1').html(productHTML);
            $('#contenedor-resultados').html('');
            $('#quickcartbuscador').addClass('show');
            $('#autoSuggest_level1 li > a').off('click').on('click',function(){
               showResults(searchTerm, $(this).attr('product_id'));
            });
        }else{
            $('#autoSuggest_level1').html('');
            $('.searchbox-overlay').remove();
            $('#quickcartbuscador').removeClass('show');
        }
    });
}

$(document).on("click", ".main-search-form .clear-search-keyword", function () {
    $("#searchtextinput").val("");
    $('#quickcartbuscador').removeClass('show');
    $('.searchbox-overlay').remove();
});

function setQuantityInSession(sessionKey, quantityToSet) {
    var currentValue = sessionStorage.getItem(sessionKey);
    if (currentValue == undefined) {
        sessionStorage.setItem(sessionKey, quantityToSet);
    } else if (currentValue != undefined && currentValue != quantityToSet) {
        sessionStorage.setItem(sessionKey, quantityToSet);
    }
}

$('html').on('click', function (e) {
    if (typeof $(e.target).data('original-title') == 'undefined' && (!$(e.target).parents().is('.search-suggestion') && !$(e.target).is('#searchtextinput') && e.target.nodeName != 'INPUT')) {
        clearSearchKeyword();
    }
});

function getDimensionSearchGroups(data) {
    var dimensionSearchGroups = null;
    dimensionSearchGroups = data.contents[0].autoSuggest[0].dimensionSearchGroups;
    return dimensionSearchGroups;
}

$('#quickcartbuscador').delegate('.departments li', 'click', function () {
    var thisUrl = $(this).find('a').attr('data-link');
    var categoryLabel = $(this).find('a').attr('data-search');
    var searchTerm = $.trim($('#searchtextinput').val());
    var foldedSearchTerm = accent_fold(searchTerm.trim());
    var foldedCategorylabel = accent_fold(categoryLabel);
    console.log("foldedSearchTerm :" + foldedSearchTerm);
    console.log("foldedCategorylabel :" + foldedCategorylabel);
    if (foldedSearchTerm === foldedCategorylabel) {
        if (thisUrl.includes("?")) {
            thisUrl = thisUrl.concat("&");
        } else {
            thisUrl = thisUrl.concat("?");
        }
        thisUrl = thisUrl.concat('saveSearchTerm=true');
        thisUrl = thisUrl.concat('&searchTerm=' + encodeURIComponent(categoryLabel));
    }
    showPopup(thisUrl);
});
$('#quickcartbuscador').delegate('.departments li', 'mouseover', function () {
    updateSearchBoxResults(this);
});
$(document).on('mouseover', '.js-a-hover', function () {
    $('.js-a-hover').removeClass('js-active');
    $(this).addClass('js-active');
});

function updateSearchBoxResults(object) {
    rrProductSearchIds = "";
    var currentObj = $(object);
    $('.departments li.active').removeClass('active');
    currentObj.addClass('active');
    return false;
    var imgHTML = '<img src="/static/img/loader.gif" alt="Cargando..." style="position: absolute; margin-top: 250px; margin-left: 280px;" />';
    $('#tab-1').html(imgHTML);
    var link = currentObj.find('a').attr('data-link');
    var contentPath = '/category';
    if (link != undefined && link.indexOf(contentPath) == -1) {
        contentPath = '/search';
    }
    var thisUrl = currentObj.find('a').attr('data-mouseover');
    var searchTerm = currentObj.find('a').attr('data-search');
    var otherSiteContext = $(currentObj).find('a').attr('data-site-context');
    var showSearchButton = $(currentObj).find('a').attr('data-show-button');
    var ajaxS1 = $.ajax({type: "post", url: thisUrl, dataType: 'json', async: true});
    var searchBoxTerm = $.trim($('#searchtextinput').val());
    $.when(ajaxS1).then(function (data) {
        if (data != undefined && data != '') {
            var totalNumRecs = data.MainContent[0].totalNumRecs;
            if (totalNumRecs > 0) {
                var recordsHTML = '<div class="product-related grid-of-three clearfix">';
                var recordDisplayLength = sessionStorage.getItem("maxResultsSearchSuggestion") != undefined ? sessionStorage.getItem("maxResultsSearchSuggestion") : 10;
                recordDisplayLength = 3;
                if (recordDisplayLength > totalNumRecs) {
                    recordDisplayLength = totalNumRecs;
                }
                var productLinkPrefix = '';
                if (otherSiteContext != 'undefined' && otherSiteContext != '') {
                    productLinkPrefix = otherSiteContext + '/product/';
                } else {
                    productLinkPrefix = contextPath + '/product/';
                }
                var count = 0;
                for (i = 0; i < recordDisplayLength; i++) {
                    count++;
                    var record = data.MainContent[0].records[i];
                    var productLink = record.detailsAction.recordState;
                    var prdLinkArr = productLink.split("/");
                    productLink = prdLinkArr[1] + "/" + record.attributes['sku.repositoryId'];
                    productLink = productLinkPrefix.concat(productLink);
                    var contentUOM = record.attributes['product.contentUOM'];
                    var prdDisplayName = record.attributes['product.brand'][0].concat(', ').concat(record.attributes['product.displayName'][0]);
                    rrProductSearchIds = rrProductSearchIds + record.attributes['sku.repositoryId'] + ",";
                    recordsHTML = recordsHTML.concat('<div id="');
                    recordsHTML = recordsHTML.concat('productBox[' + record.attributes['sku.repositoryId'] + ']');
                    recordsHTML = recordsHTML.concat('" class="box-product">');
                    recordsHTML = recordsHTML.concat(' <div class="product-holder clearfix"><div class="responsive-holder-xs"><div class="product-image"><div class="product-tags">');
                    var isStarProduct = record.attributes['product.isStarProduct'] ? record.attributes['product.isStarProduct'][0] : undefined;
                    if (isStarProduct != undefined && isStarProduct == 'Yes') {
                        recordsHTML = recordsHTML.concat('<span class="featured-mark">Destacado</span>');
                    }
                    var isNew = record.attributes['product.isNew'];
                    if (isNew != undefined && isNew == 'Ver nuevos') {
                        recordsHTML = recordsHTML.concat('<span class="featured-mark new-mark">Nuevo</span>');
                    }
                    var campaigns = record.attributes['sku.campaigns'];
                    if (campaigns != undefined) {
                        for (var j = 0; j < campaigns.length; j++) {
                            var campaign = $.trim(campaigns[j].replace(" ", "")).toLowerCase();
                            recordsHTML = recordsHTML.concat('<span class="featured-mark ');
                            recordsHTML = recordsHTML.concat(campaign);
                            recordsHTML = recordsHTML.concat('"></span>');
                        }
                    }
                    recordsHTML = recordsHTML.concat('</div><a href="javascript:;"');
                    recordsHTML = recordsHTML.concat(productLink);
                    recordsHTML = recordsHTML.concat(' onclick="showPopup(\'');
                    recordsHTML = recordsHTML.concat(productLink);
                    recordsHTML = recordsHTML.concat('\');"');
                    recordsHTML = recordsHTML.concat('" class="product-link"> <div class="photo-container"><img src="');
                    var imageURL = contextPath + '/contentassets/img/products/missingProduct_medium.jpg';
                    if (record.attributes['sku.mediumImageUrl'] != undefined) {
                        imageURL = record.attributes['sku.mediumImageUrl'][0];
                    }
                    recordsHTML = recordsHTML.concat(imageURL);
                    recordsHTML = recordsHTML.concat('" class="img-responsive" /></div></a></div></div>');
                    recordsHTML = recordsHTML.concat('<div class="responsive-holder-xs"><div class="product-details"><a href="javascript:;"');
                    recordsHTML = recordsHTML.concat(' onclick="showPopup(\'');
                    recordsHTML = recordsHTML.concat(productLink);
                    recordsHTML = recordsHTML.concat('\');"');
                    recordsHTML = recordsHTML.concat('" class="product-link">');
                    recordsHTML = recordsHTML.concat('<span class="product-name js-ellipsis">');
                    recordsHTML = recordsHTML.concat(prdDisplayName);
                    recordsHTML = recordsHTML.concat('</span></a>');
                    recordsHTML = recordsHTML.concat('<div id="rrSearchBV-' + record.attributes['sku.repositoryId'] + '" class="product-rating"></div>');
                    var internetPriceObj = record.attributes['sku.internetPrice'];
                    var normalPriceObj = record.attributes['sku.normalPrice'];
                    var lmcPriceObj = record.attributes['sku.lmcPrice'];
                    recordsHTML = recordsHTML.concat('<div class="product-price product-card">');
                    if (contentUOM != undefined) {
                        recordsHTML = recordsHTML.concat('<span class="product-attribute">');
                        recordsHTML = recordsHTML.concat(contentUOM);
                        recordsHTML = recordsHTML.concat('</span>');
                    }
                    if (lmcPriceObj != undefined) {
                        var lmcPrice = parseFloat(lmcPriceObj[0]);
                        var lmcPriceFmt = formatMoney(lmcPriceObj[0]);
                        recordsHTML = recordsHTML.concat('<span class="price-sell tagcolor">$');
                        recordsHTML = recordsHTML.concat(lmcPriceFmt);
                        recordsHTML = recordsHTML.concat(' <i class="ico-lidercard_sm"></i></span>');
                        if (internetPriceObj != undefined) {
                            var internetPrice = parseFloat(internetPriceObj[0]);
                            var internetPriceFmt = formatMoney(internetPriceObj[0]);
                            recordsHTML = recordsHTML.concat('<span class="price-internet">Internet:  <span>$');
                            recordsHTML = recordsHTML.concat(internetPriceFmt);
                            recordsHTML = recordsHTML.concat('</span></span>');
                            if (normalPriceObj != undefined) {
                                var normalPrice = parseFloat(normalPriceObj[0]);
                                var normalPriceFmt = formatMoney(normalPriceObj[0]);
                                if (normalPrice != internetPrice) {
                                    recordsHTML = recordsHTML.concat('<span class="price-normal">Normal: $');
                                    recordsHTML = recordsHTML.concat(normalPriceFmt);
                                    recordsHTML = recordsHTML.concat('</span>');
                                }
                                if (normalPrice == internetPrice) {
                                    var save = internetPrice - lmcPrice;
                                    var saveFmt = formatMoney(save.toFixed(2));
                                    recordsHTML = recordsHTML.concat('<p class="save">Ahorro Lider MasterCard: <span>$');
                                    recordsHTML = recordsHTML.concat(saveFmt);
                                    recordsHTML = recordsHTML.concat('</span>');
                                }
                            }
                        }
                    }
                    if (lmcPriceObj == undefined && internetPriceObj != undefined) {
                        if (normalPriceObj != undefined) {
                            var internetPrice = parseFloat(internetPriceObj[0]);
                            var internetPriceFmt = formatMoney(internetPriceObj[0]);
                            var normalPrice = parseFloat(normalPriceObj[0]);
                            var normalPriceFmt = formatMoney(normalPriceObj[0]);
                            if (normalPrice != internetPrice) {
                                var save = normalPrice - internetPrice;
                                var saveFmt = formatMoney(save.toFixed(2));
                                var perecent = (save * 100) / normalPrice;
                                var perecentFmt = Math.round(perecent);
                                recordsHTML = recordsHTML.concat('<span class="price-sell"> $');
                                recordsHTML = recordsHTML.concat(internetPriceFmt);
                                if (perecentFmt >= 1) {
                                    recordsHTML = recordsHTML.concat(' <span>-');
                                    recordsHTML = recordsHTML.concat(perecentFmt);
                                    recordsHTML = recordsHTML.concat('%</span>');
                                }
                                recordsHTML = recordsHTML.concat('</span>');
                                recordsHTML = recordsHTML.concat('<span class="price-normal">Normal: $');
                                recordsHTML = recordsHTML.concat(normalPriceFmt);
                                recordsHTML = recordsHTML.concat('</span>');
                                recordsHTML = recordsHTML.concat(' <span class="price-save">Ahorro: $');
                                recordsHTML = recordsHTML.concat(saveFmt);
                                recordsHTML = recordsHTML.concat('</span>');
                            }
                            if (normalPrice == internetPrice) {
                                recordsHTML = recordsHTML.concat('<span class="price-sell">$');
                                recordsHTML = recordsHTML.concat(internetPriceFmt);
                                recordsHTML = recordsHTML.concat('</span>');
                            }
                        }
                        if (normalPrice == undefined) {
                            recordsHTML = recordsHTML.concat('<span class="price-sell">$');
                            recordsHTML = recordsHTML.concat(internetPriceFmt);
                            recordsHTML = recordsHTML.concat('</span>');
                        }
                    }
                    recordsHTML = recordsHTML.concat('</div></div></div></div></div>');
                }
                recordsHTML = recordsHTML.concat('</div>');
                console.log("showSearchButton 1:" + showSearchButton);
                if (showSearchButton == true || showSearchButton == 'true') {
                    recordsHTML = recordsHTML + ' <div class="view-all-results"><a href="' + link + '" class="btn btn-new btn-secondary">Ver todos los resultados</a></div>';
                }
                $.each(data.SecondaryContent[0].navigation, function (key, navigation) {
                    var numRefinements = sessionStorage.getItem("maxBrandSearchSuggestion") != undefined ? sessionStorage.getItem("maxBrandSearchSuggestion") : 15;
                    recordsHTML = recordsHTML.concat('<div class="brands"><h3>Marcas</h3> <ul class="list-inline"> ');
                    $.each(navigation.refinements, function (key, refinement) {
                        if (key < numRefinements) {
                            if (contentPath == undefined || contentPath == '') {
                                contentPath = '/category';
                            }
                            var urlPrefix = '';
                            if (otherSiteContext != 'undefined' && otherSiteContext != '') {
                                urlPrefix = otherSiteContext.concat(contentPath);
                            } else {
                                urlPrefix = contextPath.concat(contentPath);
                            }
                            var url = refinement.navigationState;
                            var n = url.indexOf('?');
                            if (contentPath == '/search') {
                                var searchTermStr = '?Ntt='.concat(searchTerm);
                                url = urlPrefix.concat(url.substr(0, n)).concat(searchTermStr);
                            } else {
                                url = urlPrefix.concat(url.substr(0, n));
                            }
                            recordsHTML = recordsHTML.concat('<li><a class="js-a-hover" href="');
                            recordsHTML = recordsHTML.concat(url);
                            recordsHTML = recordsHTML.concat('">');
                            recordsHTML = recordsHTML.concat(refinement.label);
                            recordsHTML = recordsHTML.concat('</a></li>');
                        }
                    });
                    recordsHTML = recordsHTML.concat('</ul></div>');
                });
                $('#tab-1').html(recordsHTML);
                $('#tab-1 .js-ellipsis').dotdotdot();
                richRelevanceRatingSearch();
            }
        }
    });
}

function cutOffText(text, characters) {
    var cutOffThis = text;
    cutOffResult = $.trim(cutOffThis).substr(0, characters) + '...';
    return cutOffResult;
}

function formatMoney(priceText) {
    priceText = priceText.toString();
    var n = priceText.indexOf('.');
    var formattedPrice = '';
    var price = priceText.substr(0, n).split('').reverse().join('');
    if (price.length > 3) {
        var j = 1;
        for (var i = 0; i < price.length; i++) {
            formattedPrice = formattedPrice.concat(price[i]);
            if (i > 0 && j % 3 == 0 && i < price.length - 1) {
                formattedPrice = formattedPrice.concat('.');
            }
            j++;
        }
        formattedPrice = formattedPrice.split('').reverse().join('');
    } else {
        formattedPrice = priceText.substr(0, n);
    }
    return formattedPrice;
}

function displayLabelStr(searchTerm, labelStr) {
    var labelStrLower = accent_fold(labelStr);
    var searchTermLower = accent_fold(searchTerm);
    var searchTermSplit = searchTermLower.split(" ");
    var labelStrOrgSpl = labelStr.split(" ");
    var labelStrSplit = labelStrLower.split(" ");
    var resultLabel = '';
    for (i = 0; i < labelStrSplit.length; i++) {
        var isSet = false;
        for (j = 0; j < searchTermSplit.length; j++) {
            if (labelStrSplit[i].indexOf(searchTermSplit[j]) != -1) {
                if (resultLabel != '') {
                    resultLabel = resultLabel.concat(' ');
                }
                var n = labelStrSplit[i].indexOf(searchTermSplit[j]);
                var tempStr = labelStrOrgSpl[i];
                var x = tempStr.substr(0, n)
                var y = tempStr.substr(n, searchTermSplit[j].length);
                var z = tempStr.substr(n + searchTermSplit[j].length, labelStrSplit[j].length);
                resultLabel = resultLabel.concat(x + '<span>' + y + '</span>' + z);
                isSet = true;
                break;
            }
        }
        if (!isSet) {
            if (resultLabel != '') {
                resultLabel = resultLabel.concat(' ');
            }
            resultLabel = resultLabel.concat(labelStrOrgSpl[i]);
        }
    }
    return resultLabel;
}

$("#searchBoxForm").submit(function (event) {
    var urlSearch = true;
    event.preventDefault();
    var searchedText = $("#searchtextinput").val();
    var hasResults = $(".departments").length;
    var listItems = $(".departments li");
    listItems.each(function () {
        var suggestedResult = $(this).find("a");
        var dataSearch = suggestedResult.attr("data-search");
        if (dataSearch != undefined && searchedText != undefined) {
            if (normalize($.trim(dataSearch).toLowerCase()) === normalize($.trim(searchedText).toLowerCase())) {
                urlSearch = false;
                var thisUrl = suggestedResult.attr('data-link');
                thisUrl = thisUrl + (thisUrl.includes('?') ? '&' : '?') + 'saveSearchTerm=true';
                thisUrl = thisUrl.concat('&searchTerm=' + encodeURIComponent($(this).text().trim()));
                saleForceSearchEvent("search", searchTerm);
                showPopup(thisUrl);
            }
        }
    });
    if (urlSearch) {
        var actionURL = $(this).attr('action');
        var searchTerm = $.trim($('#searchtextinput').val());
        var saveSearchTerm = false;
        if (searchTerm.length >= minInputLength) {
            saleForceSearchEvent("search", searchTerm);
            actionURL = actionURL.concat('?Ntt=' + searchTerm).concat('&ost=' + encodeURIComponent(searchTerm));
            location.href = actionURL;
        }
    }
});

function saleForceSearchEvent(sfEvent, searchTerm) {
    _etmc.push(["setOrgId", orgId]);
    _etmc.push(["trackPageView", {"search": searchTerm}]);
}

var normalize = (function () {
    var from = "ÃƒÃ€ÃÃ„Ã‚ÃˆÃ‰Ã‹ÃŠÃŒÃÃÃŽÃ’Ã“Ã–Ã”Ã™ÃšÃœÃ›Ã£Ã Ã¡Ã¤Ã¢Ã¨Ã©Ã«ÃªÃ¬Ã­Ã¯Ã®Ã²Ã³Ã¶Ã´Ã¹ÃºÃ¼Ã»Ã‘Ã±Ã‡Ã§",
        to = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc", mapping = {};
    for (var i = 0, j = from.length; i < j; i++)
        mapping[from.charAt(i)] = to.charAt(i);
    return function (str) {
        var ret = [];
        for (var i = 0, j = str.length; i < j; i++) {
            var c = str.charAt(i);
            if (mapping.hasOwnProperty(str.charAt(i)))
                ret.push(mapping[c]); else
                ret.push(c);
        }
        return ret.join('');
    }
})();
$("#searchMobileBox").submit(function (event) {
    var urlSearch = true;
    event.preventDefault();
    var searchedText = $("#searchmobiletextinputCustom").val();
    var hasResults = $(".departments").length;
    var listItems = $(".departments li");
    listItems.each(function () {
        var suggestedResult = $(this).find("a");
        var dataSearch = suggestedResult.attr("data-search");
        if (dataSearch != undefined && searchedText != undefined) {
            if (normalize($.trim(dataSearch).toLowerCase()) === normalize($.trim(searchedText).toLowerCase())) {
                urlSearch = false;
                var thisUrl = suggestedResult.attr('data-link');
                if (thisUrl.includes("?")) {
                    thisUrl = thisUrl.concat("&");
                } else {
                    thisUrl = thisUrl.concat("?");
                }
                thisUrl = thisUrl.concat('saveSearchTerm=true');
                thisUrl = thisUrl.concat('&searchTerm=' + encodeURIComponent($(this).text().trim()));
                showPopup(thisUrl);
            }
        }
    });
    if (urlSearch) {
        var actionURL = $(this).attr('action');
        var searchTerm = $.trim($('#searchmobiletextinputCustom').val());
        if (searchTerm.length >= minInputLength) {
            actionURL = actionURL.concat('?Ntt=' + searchTerm).concat('&ost=' + encodeURIComponent(searchTerm));
            ;location.href = actionURL;
        }
    }
});

function ajaxCallAutoSuggest(url, dataType) {
    var result = '';
    $.ajax({
        type: "post", url: url, dataType: dataType, async: false, success: function (data) {
            result = data;
        }
    });
    return result;
}

var scIni = $(".js-ficha-scroll").length ? 550 : 200;

function searchTTop(ltop, lscroll) {
    var win = $(window).width();
    if (win < 768) {
        $('.buscador.js-tooltip').css('top', 100);
    } else if (767 < win && win < 991) {
        if (lscroll > scIni) {
            $('.buscador.js-tooltip').css('top', 125);
        } else {
            $('.buscador.js-tooltip').css('top', 145);
        }
    } else {
        if (lscroll > scIni) {
            $('.buscador.js-tooltip').css('top', ltop);
        } else {
            $('.buscador.js-tooltip').css('top', '');
        }
    }
}

$(window).on('resize', function () {
    searchTTop();
});
$(function () {
    $('.js-btn-search-mobile').on('click', function (e) {
        var $prtForm = $(this).parents('form');
        if ($prtForm.length) {
            $prtForm.submit();
        }
    });
});

function getGmSuggestions(searchTerm, resultHTML, gmConextPath, showResultsButtonOnGR, gmSiteLable, showSearchHistoryOnGR, productHTML, noOfGMCategoryToDisplayOnGR) {
    console.log("start getGmSuggestions");
    var contentCollection = '/content/Shared/Auto-Suggest Panels';
    var url = contextPath + '/assembler' + "?assemblerContentCollection=" +
        contentCollection + "&format=json&otherSearchSite=gm&Dy=1&Ntt=" + encodeURIComponent(searchTerm) + "*";
    console.log("gm url" + url);
    var gmCatArr = [];
    var ajgrS1 = $.ajax({type: "post", url: url, dataType: 'json', async: true});
    $.when(ajgrS1).then(function (gmdata, grCategoryHTML) {
        var gmDimensionSearchGroups = getDimensionSearchGroups(gmdata);
        console.log("gmConextPath" + gmConextPath);
        if (gmDimensionSearchGroups && gmDimensionSearchGroups.length > 0) {
            var gmCategoryHTML = '';
            var count = 0;
            $.each(gmDimensionSearchGroups, function (key, gmDimensionSearchGroups) {
                var dimensionName = gmDimensionSearchGroups.dimensionName;
                if (dimensionName == 'product.category') {
                    var gmCategories = [];
                    $.each(gmDimensionSearchGroups.dimensionSearchValues, function (key, dimensionSearchValue) {
                        var isMakePublic = "true";
                        isMakePublic = dimensionSearchValue.properties['category.makePublic'];
                        var labelStr = dimensionSearchValue.label;
                        if (isMakePublic != "false" && $.inArray(labelStr, gmCatArr) === -1) {
                            gmCategories.push(dimensionSearchValue);
                            gmCatArr.push(labelStr);
                        }
                    });
                    gmCategories.sort(SortByBestSellerAndCount);
                    if (gmCategories.length > 0) {
                        gmCategoryHTML = '<h2>' + gmSiteLable + '</h2><ul class="nav nav-pills departments">';
                    }
                    $.each(gmCategories, function (key, dimensionSearchValue) {
                        var labelStr = dimensionSearchValue.label;
                        if (count < noOfGMCategoryToDisplayOnGR) {
                            var contentPath = dimensionSearchValue.contentPath;
                            var navigationState = dimensionSearchValue.navigationState;
                            var url = gmConextPath.concat(contentPath);
                            var n = navigationState.indexOf('?');
                            url = url.concat(navigationState.substr(0, n));
                            console.log("gm navigationState" + navigationState);
                            var urlSearch = contextPath + '/autosuggest'.concat(navigationState);
                            var resultLabel = labelStr;
                            var isMakePublic = "true";
                            isMakePublic = dimensionSearchValue.properties['category.makePublic'];
                            if (isMakePublic != "false") {
                                gmCategoryHTML = gmCategoryHTML.concat('<li><a data-toggle="tab" href="#tab-1" data-link="');
                                gmCategoryHTML = gmCategoryHTML.concat(url);
                                gmCategoryHTML = gmCategoryHTML.concat('" data-search="');
                                gmCategoryHTML = gmCategoryHTML.concat(labelStr);
                                gmCategoryHTML = gmCategoryHTML.concat('" data-mouseover="');
                                gmCategoryHTML = gmCategoryHTML.concat(urlSearch);
                                gmCategoryHTML = gmCategoryHTML.concat('" data-site-context="');
                                gmCategoryHTML = gmCategoryHTML.concat(gmConextPath);
                                gmCategoryHTML = gmCategoryHTML.concat('" data-show-button="');
                                gmCategoryHTML = gmCategoryHTML.concat(showResultsButtonOnGR);
                                gmCategoryHTML = gmCategoryHTML.concat('">');
                                gmCategoryHTML = gmCategoryHTML.concat(resultLabel);
                                gmCategoryHTML = gmCategoryHTML.concat('</a></li>');
                                gmCatArr.push(labelStr);
                                count++;
                            }
                        }
                    });
                }
            });
            if (gmCategoryHTML != '') {
                gmCategoryHTML = gmCategoryHTML.concat('</ul>');
                resultHTML = resultHTML.concat(gmCategoryHTML);
            }
            if (resultHTML == '' && productHTML != '' && productHTML != undefined) {
                resultHTML = productHTML;
            }
            if (showSearchHistoryOnGR == true || showSearchHistoryOnGR == 'true') {
                console.log("get search history");
                showSearchHistory(resultHTML);
            } else if (resultHTML != '') {
                $('#autoSuggest_level1').html(resultHTML);
                $('.search-suggestion').addClass('show');
                var firstSuggestion = $('.departments li').first();
                updateSearchBoxResults(firstSuggestion);
                $(firstSuggestion).removeClass("active");
                if (!$('.searchbox-overlay').length) {
                    $('body').append('<div class="searchbox-overlay"></div>');
                }
            }
        } else {
            if (showSearchHistoryOnGR == true || showSearchHistoryOnGR == 'true') {
                console.log("get search history");
                showSearchHistory(resultHTML);
            } else {
                if (resultHTML != '') {
                    console.log("resultHTML :" + resultHTML);
                    $('#autoSuggest_level1').html(resultHTML);
                    $('.search-suggestion').addClass('show');
                    var firstSuggestion = $('.departments li').first();
                    updateSearchBoxResults(firstSuggestion);
                    $(firstSuggestion).removeClass("active");
                    if (!$('.searchbox-overlay').length) {
                        $('body').append('<div class="searchbox-overlay"></div>');
                    }
                }
            }
        }
    });
}

function showSearchHistory(resultHTML) {
    var ccokiestr = $("#searchTermsFromCookie").val();
    console.log("cookieSearchTerms :" + ccokiestr);
    if (ccokiestr != '') {
        resultHTML = resultHTML.concat('<h2>BÃºsquedas Recientes</h2><ul class=" nav nav-pills recent-searches">');
        var searchTermsStr = ccokiestr.split('_');
        for (cnt = 0; cnt < searchTermsStr.length; cnt++) {
            console.log("Search term " + searchTermsStr[cnt]);
            resultHTML = resultHTML + '<li><a href="' + contextPath + '/search?Ntt=' + decodeURIComponent(searchTermsStr[cnt]) + '">' + decodeURIComponent(searchTermsStr[cnt]) + '</a></li>';
        }
        resultHTML = resultHTML + '</ul> <div class="clear-search-history"><a href="javascript:deleteSearchCookie();" class="btn-clear-history">Eliminar historial</a></div>';
    }
    if (resultHTML != '') {
        console.log("resultHTML :" + resultHTML);
        $('#autoSuggest_level1').html(resultHTML);
        $('#quickcartbuscador').addClass('show');
        var firstSuggestion = $('.departments li').first();
        updateSearchBoxResults(firstSuggestion);
        $(firstSuggestion).removeClass("active");
        if (!$('.searchbox-overlay').length) {
            $('body').append('<div class="searchbox-overlay"></div>');
        }
    }
}

function deleteSearchCookie() {
    $("#searchTermsFromCookie").val('');
    var url = contextPath + "/includes/search/clearsearchtermhistory.jsp";
    var ajclear = $.ajax({type: "post", url: url, dataType: 'json', async: true});
    $.when(ajclear).then(function (grdata, grCategoryHTML) {
        clearSearchKeyword();
    });
    clearSearchKeyword();
}

$(".main-search-form .clear-search-keyword").click(function () {
    clearSearchKeyword();
});

function clearSearchKeyword() {
    $('#searchtextinput').val("");
    $('.searchbox-overlay').remove();
    $('#quickcartbuscador').removeClass('show');
    $('#tab-1').html('');
    $('#autoSuggest_level1').html('');
}

$('#searchtextinput').keyup(function (e) {
    var tecla = e.keyCode
    var searchTerm = $.trim($(this).val());
    if (tecla == 13) {
        showResults(searchTerm);
    }
});
$(function () {
    $(document).on("keyup", function (e) {
        var $LShrCon = $('#quickcartbuscador');
        if ($('#quickcartbuscador').is(':visible')) {
            $LShrCon.find('.departments');
            switch (e.which) {
                case 40:
                    if ($LShrCon.find('.departments li').hasClass('active')) {
                        var $ItemAct = $LShrCon.find('.departments li.active:eq(0)');
                        if (!$ItemAct.is(':last-child')) {
                            $LShrCon.find('.departments li').removeClass('active');
                            $ItemAct.next().addClass('active');
                            var ItemTab = $ItemAct.next().find('a').attr('href');
                            $(ItemTab).parents('.tab-content').find('.tab-pane.active').removeClass('active');
                            $(ItemTab).addClass('active');
                            $ItemAct.next().trigger("mouseover");
                        } else {
                            var $LShrConN = $ItemAct.parents('.departments').nextAll('.departments');
                            if ($LShrConN.length) {
                                $LShrCon.find('.departments li').removeClass('active');
                                $LShrConN.find(':first-child').addClass('active');
                                var ItemTab = $LShrConN.find(':first-child').find('a').attr('href');
                                $(ItemTab).parents('.tab-content').find('.tab-pane.active').removeClass('active');
                                $(ItemTab).addClass('active');
                            }
                        }
                    }
                    break;
                case 38:
                    if ($LShrCon.find('.departments li').hasClass('active')) {
                        var $ItemAct = $LShrCon.find('.departments li.active:eq(0)');
                        if (!$ItemAct.is(':first-child')) {
                            $LShrCon.find('.departments li').removeClass('active');
                            $ItemAct.prev().addClass('active');
                            var ItemTab = $ItemAct.prev().find('a').attr('href');
                            $(ItemTab).parents('.tab-content').find('.tab-pane.active').removeClass('active');
                            $(ItemTab).addClass('active');
                            $ItemAct.prev().trigger("mouseover");
                        } else {
                            var $LShrConN = $ItemAct.parents('.departments').prevAll('.departments');
                            if ($LShrConN.length) {
                                $LShrCon.find('.departments li').removeClass('active');
                                $LShrConN.find(':last-child').addClass('active');
                                var ItemTab = $LShrConN.find(':last-child').find('a').attr('href');
                                $(ItemTab).parents('.tab-content').find('.tab-pane.active').removeClass('active');
                                $(ItemTab).addClass('active');
                            }
                        }
                    }
                    break;
                case 39:
                    var $LTabAct = $('.tab-content').find('.tab-pane.active');
                    if ($LTabAct.length) {
                        var $ItemAct = $LTabAct.find('.active');
                        if ($ItemAct.length) {
                            if (!$ItemAct.is(':last-child')) {
                                $LTabAct.find('.active').removeClass('active');
                                $ItemAct.next().addClass('active');
                            } else {
                                var $LShrConN = $ItemAct.parent().nextAll('ul:eq(0)').find("a");
                                if ($LShrConN.length) {
                                    $LTabAct.find('.active').removeClass('active');
                                    $LShrConN.parents('ul').find("li:first-child").addClass('active');
                                } else {
                                    $LTabAct.find('.active').removeClass('active');
                                    $LTabAct.find('.grid-of-three > .box-product:first-child').addClass('active');
                                }
                            }
                        } else {
                            $LTabAct.find('.grid-of-three > .box-product:first-child').addClass('active');
                        }
                    }
                    break;
                case 37:
                    var $LTabAct = $('.tab-content').find('.tab-pane.active');
                    if ($LTabAct.length) {
                        var $ItemAct = $LTabAct.find('.active');
                        if ($ItemAct.length) {
                            if (!$ItemAct.is(':first-child')) {
                                $LTabAct.find('.active').removeClass('active');
                                $ItemAct.prev().addClass('active');
                            } else {
                                var $LShrConN = $ItemAct.parent().prevAll('ul:eq(0), div:eq(0)').find("a");
                                if ($LShrConN.length) {
                                    $LTabAct.find('.active').removeClass('active');
                                    if ($LShrConN.parents('ul').length) {
                                        $LShrConN.parents('ul').find("li:last-child").addClass('active');
                                    } else {
                                        $LShrConN.parents('.grid-of-three').find(".display-pantalla").addClass('active');
                                    }
                                } else {
                                    $LTabAct.find('.active').removeClass('active');
                                    $LTabAct.find('ul:last-child li:last-child').addClass('active');
                                }
                            }
                        } else {
                        }
                    }
                    break;
                case 13:
                    var $LTabActItem = $('.tab-content').find('.tab-pane.active .active');
                    if ($LTabActItem.length) {
                        var LHref = $LTabActItem.find('a').attr('href');
                        window.location.href = LHref;
                    }
                    break;
                default:
                    return;
            }
            e.preventDefault();
        }
    });
    $(document).on("mouseenter", ".tab-content .tab-pane a", function (e) {
        var $this = $(this);
        $(".tab-content").find(".tab-pane .active").removeClass('active');
        if ($this.parents(".display-pantalla").length) {
            $this.parents(".display-pantalla").addClass('active');
        } else {
            $this.parent().addClass('active');
        }
    });
});

function showPopup(url) {
    console.log("Inside showPopup");
    console.log("url :" + url);
    if (url.indexOf('electrohogar') != -1) {
        var navigationCount = $("#navigationPopUpCount").val() * 1;
        console.log("navigationCount 1 :" + navigationCount);
        if (navigationCount != '') {
            navigationCount = navigationCount + 1;
        } else {
            navigationCount = 1;
        }
        console.log("navigationCount 2 :" + navigationCount);
        $("#navigationPopUpCount").val(navigationCount);
        var popCountUrl = contextPath + "/includes/search/updatePopupCount.jsp?popupCount=" + navigationCount;
        ;var ajclear = $.ajax({type: "post", url: popCountUrl, dataType: 'json', async: true});
        console.log("url :" + url);
        var maxPopupCount = $("#maxPopupCount").val();
        console.log("maxPopupCount  :" + maxPopupCount);
        if (navigationCount <= maxPopupCount) {
            if (url.indexOf('?') == -1) {
                url = url.concat('?showPopup=true');
            } else {
                url = url.concat('&showPopup=true');
            }
        }
    }
    window.location.href = url;
}

function SortByBestSellerAndCount(x, y) {
    if (x.properties['category.bestSeller'] == y.properties['category.bestSeller']) {
        return ((x.count == y.count) ? 0 : ((x.count > y.count) ? -1 : 1));
    } else if (x.properties['category.bestSeller'] > y.properties['category.bestSeller']) {
        return -1;
    } else {
        return 1;
    }
}

$("#searchsubmitbutton").on("click", function (event) {
    event.preventDefault();
    var actionURL = $('#searchBoxForm').attr('action');
    var saveSearchTerm = false;
    var searchTerm = $.trim($('#searchtextinput').val());
    if (searchTerm.length >= minInputLength) {
        var foldedSearchTerm = accent_fold(searchTerm.trim());
        $(".departments li").each(function (index) {
            var thisText = accent_fold($(this).text().trim());
            if (foldedSearchTerm === thisText) {
                saveSearchTerm = true;
            }
        });
        saleForceSearchEvent(searchTerm);
        actionURL += '?Ntt=' + encodeURIComponent(searchTerm).concat('&ost=' + encodeURIComponent(searchTerm));
        location.href = actionURL;
    }
});