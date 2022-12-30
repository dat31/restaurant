$(async function () {

    const $orderForm = $('#order-form')
    const params = new URLSearchParams(window.location.search)
    const ordId = params.get('id');
    const resp = await service.get('/auth')
    const { role } = resp.data
    const order = new Order()

    order.setHandler(function (foods) {
        $('#foods-container').empty()
        foods.forEach(function (f) {
            const $foodEl = getFoodElement(f)
            $('#foods-container').append($foodEl)
        })
        const total = foods.reduce(function (acc, f) {
            return acc + f.qty * f.price
        }, 0)
        $('#total-price').text(`$${total}`)
        $('.products-container .product').each(function (_, el) {
            const id = $(el).prop('id').replace('prod-', '')
            if (!foods.some(f => f.id.toString() === id.toString())) {
                $(el).find('.product-check').addClass('d-none')
                $(el).find('.product-price').addClass('text-muted')
            }
        })
    })

    if (ordId) {
        await getOdDetail(ordId)
    }

    await getProds()
    hideLoader()
    adjustStatusInput()
    handleSearchProd()

    $orderForm.submit(async function (evt) {
        evt.preventDefault()

        if ($('#status').val() === 'CANCELLED') {
            $('#confirm-modal').modal('show')
            $('#confirm-btn').click(async function () {
                await service.put(`/order/${ordId}`, { status: 'CANCELLED' })
                $('#confirm-btn').off('click')
                if (role !== 'ADMIN') {
                    $('#status').prop('disabled', true)
                    $('#submit-order-btn').prop('disabled', true)
                    disableAllInputs()
                }
            })
            return;
        }

        const req = {}
        $orderForm.find('input').each(function (_, input) {
            req[$(input).prop('id')] = $(input).val()
        })
        req.message = $orderForm.find('#message').val()
        req.foods = order.getFoods()
        if (ordId) {
            await service.put(`/order/${ordId}`, req)
        } else {
            await service.post('/order', req)
        }
        showModal(
            'Success',
            `Order has been ${ordId ? `update` : 'created'} successfully!`)
        if (!ordId) {
            $orderForm.trigger('reset')
        }
    })

    async function getOdDetail(id) {
        const resp = await service.get(`/order/${id}`)
        const { numOfGuests, datetime, message, status, products: foods } = resp.data.order
        const date = new Date(datetime)
        $orderForm.find('#numOfGuests').val(numOfGuests)
        $orderForm.find('#datetime').val(date.toISOString().substring(0, 10))
        $orderForm.find('#message').val(message)
        $orderForm.find('#status').val(status)
        order.setFoods(foods.map(f => ({
            ...f,
            qty: f.orderItem.qty,
        })))
        adjustStatusInput(status)

    }

    async function adjustStatusInput(odStatus) {
        if (odStatus === 'CANCELLED' || (!ordId)) {
            $('#status').prop('disabled', true)
        }
        if (odStatus === 'CANCELLED' && role !== 'ADMIN') {
            disableAllInputs()
        }
        if (role !== 'ADMIN') {
            $('#completed').remove()
        }
    }

    function showModal(title, msg) {
        $("#modal .modal-title").text(title)
        $('#modal .modal-body').text(msg)
        $('#modal').modal('show')
    }

    function disableAllInputs() {
        $('input').each(function (_, input) {
            $(input).prop('disabled', true)
        })
        $('#message').prop('disabled', true)
    }

    function hideLoader() {
        $("#preloader").animate({
            'opacity': '0'
        }, 600, function () {
            setTimeout(function () {
                $("#preloader").css("visibility", "hidden").fadeOut();
            }, 300);
        });
    }

    async function getProds() {
        const resp = await service.get('/product')
        resp.data.products.forEach(function (prod) {
            const { id, name, description, price, img, type } = prod
            const $product = $(`<div class='product list-group-item w-100 cursor-pointer' id='prod-${id}'>
                    </div>`)
            const $prodImg = $(`<img width=100 height=100 class='product-img'>`)
            if (img) {
                $prodImg.attr({ src: service.getUri().concat(prod.img) })
            }
            const $prodCheck = $(`
                    <div class='d-none product-check'>
                        <i class="product-action fa fa-check bg-success"></i>
                    </div>
                `)
            const $prodText = $(`<div class="mx-4 flex-grow-1"></div> `)
            const $prodName = $(`<h4 class="mb-1 product-name">${name}</h4>`)
            const $prodDesc = $(`<p class='product-description'>${description}</p>`)
            const $prodPrice = $(`<h5 class='product-price mt-2 text-muted'>${price}$</h5> `)

            if (order.getFoods().some(f => f.id === id)) {
                $prodCheck.removeClass('d-none')
                $prodPrice.removeClass('text-muted')
            }

            $product.click(function () {
                order.addFood(prod)
                $prodCheck.removeClass('d-none')
                $prodPrice.removeClass('text-muted')
            })


            $prodText.append([$prodName, $prodDesc, $prodPrice])
            $product.append([$prodImg, $prodText, $prodCheck])
            if (type === 'Breakfast') {
                $('#breakfast-tab-pane .products-container').append($product)
            }
            else if (type === 'Dinner') {
                $('#dinner-tab-pane .products-container').append($product)
            }
            else {
                $('#lunch-tab-pane .products-container').append($product)
            }
        })
    }

    function handleSearchProd() {
        $('#prod-search-input').on('input', function () {
            const search = $(this).val()
            $('.product').each(function (_, el) {
                if ($(el).find('.product-name').text().toLowerCase().includes(search)) {
                    $(el).show()
                } else {
                    $(el).hide()
                }
            })
        })
    }

    function Order() {

        let foods = []
        let handler = function () { }

        function setHandler(h) {
            handler = h
        }

        function addFood(p) {
            if (foods.some(prod => prod.id === p.id)) {
                return;
            }
            foods.push({ ...p, qty: 1 })
            handler(foods)
        }

        function getFoods() {
            return foods
        }

        function setFoods(f) {
            foods = f
            handler(f)
        }

        function increaseQty(foodId) {
            const index = foods.findIndex(p => p.id === foodId)
            if (index === -1) {
                return
            }
            foods[index].qty = foods[index].qty + 1
            handler(foods)
        }

        function decreaseQty(foodId) {
            const index = foods.findIndex(p => p.id === foodId)
            if (index === -1) {
                return
            }
            if (foods[index].qty === 1) {
                foods = foods.filter(p => p.id !== foodId)
                handler(foods)
                return
            }
            foods[index].qty = foods[index].qty - 1
            handler(foods)
        }

        return {
            addFood,
            getFoods,
            setFoods,
            increaseQty,
            decreaseQty,
            setHandler
        }

    }

    function getFoodElement(prod) {
        const { id, name, description, price, img, qty } = prod
        const $product = $(`<div class='product list-group-item w-100 ' id='prod-${id}'>
                    </div>`)
        const $prodImg = $(`<img width=100 height=100 class='product-img'>`)
        if (img) {
            $prodImg.attr({ src: service.getUri().concat(prod.img) })
        }
        const $prodCheck = $(`
                    <div class='d-flex justify-content-between flex-column align-items-center'>
                        <i class="fa fa-chevron-up px-3 cursor-pointer"></i>
                        <h5>${qty}</h5>
                        <i class="fa fa-chevron-down px-3 cursor-pointer"></i>
                    </div>
                `)
        $prodCheck.find('.fa-chevron-up').click(function () {
            order.increaseQty(id)
        })
        $prodCheck.find('.fa-chevron-down').click(function () {
            order.decreaseQty(id)
        })
        const $prodText = $(`<div class="mx-4 flex-grow-1"></div> `)
        const $prodName = $(`<h4 class="mb-1 product-name">${name}</h4>`)
        const $prodDesc = $(`<p class='product-description'>${description}</p>`)
        const $prodPrice = $(`<h5 class='product-price mt-2'>${price * qty}$</h5> `)

        $prodText.append([$prodName, $prodDesc, $prodPrice])
        $product.append([$prodImg, $prodText, $prodCheck])
        return $product
    }

})