$(async function () {

    const resp = await service.get('/auth')
    const isAdmin = resp.data?.role === 'ADMIN'

    getProds()
    hideLoader()

    if (!isAdmin) {
        $('.create-btn').addClass('d-none')
        $('.search-btn').addClass('bordered-search-btn')
    }

    $('.create-btn').click(createProd)
    const $prodForm = $('#prod-form')
    const $prodDetailImg = $prodForm.find('.product-detail-img')
    const $prodImgInput = $('#prod-img-input')
    const $prodModal = $('#prod-modal')

    $('#prod-search-input').on('input', function () {
        const search = $(this).val()
        $('.products-container .product').each(function (_, el) {
            if ($(el).find('.product-name').text().toLowerCase().includes(search)) {
                $(el).show()
            } else {
                $(el).hide()
            }
        })
    })

    $prodImgInput.change(function () {
        const [img] = $(this).prop('files')
        const reader = new FileReader()
        reader.onload = function () {
            $prodDetailImg.css('background-image', `url(${reader.result})`)
        }
        reader.readAsDataURL(img)
    })

    $prodDetailImg.click(function () { $prodImgInput.click() })

    $prodModal.on('hidden.bs.modal', function (e) {
        $prodForm.trigger('reset')
    })

    function hideLoader() {
        $("#preloader").animate({
            'opacity': '0'
        }, 600, function () {
            setTimeout(function () {
                $("#preloader").css("visibility", "hidden").fadeOut();
            }, 300);
        });
    }

    function createProd() {
        $('#submit-prod-modal-btn').text('Create')
        $prodDetailImg.css('background-image', 'unset')
        $prodModal.modal('show')

        $prodForm.submit(async function (evt) {
            evt.preventDefault()
            if (!$prodForm.isValid()) {
                return;
            }
            const reqBody = {};
            (['name', 'price', 'description', 'type']).forEach(function (k) {
                reqBody[k] = $prodForm.find(`#${k}`).val()
            })
            const img = $prodImgInput.prop('files')[0]
            if (img) {
                reqBody.img = img.name
            }
            const resp = await service.post(`/product`, reqBody)
            $prodForm.off('submit')
            $prodModal.modal('hide')
            appendProd(resp.data.product)
        })
    }

    function deleteProd() {
        const prodId = this.id
        $("#confirm-modal").modal('show')
        $("#confirm-delete-btn")
            .on('click', async function () {
                await service.delete('/product/'.concat(prodId))
                $(`.products-container #prod-${prodId}`).remove()
                $(this).off('click')
            })
    }

    function editProd(prod, cb) {
        const { name, price, description, type } = prod
        const $editProdForm = $("#prod-form")
        $('#submit-prod-modal-btn').text('Update')
        $prodModal.modal('show')
        $editProdForm.find('#name').val(name)
        $editProdForm.find('#price').val(price)
        $editProdForm.find('#description').val(description)
        $editProdForm
            .find('.product-detail-img')
            .css('background-image', `url(${service.getUri().concat(prod.img)})`)
        $editProdForm.find('#type').find('option').each(function (_, el) {
            $(el).attr('selected', type === $(el).attr('value'))
        })
        $editProdForm.submit(async function (evt) {
            evt.preventDefault()
            if (!$editProdForm.isValid()) {
                return;
            }
            const reqBody = {};
            (['name', 'price', 'description', 'type']).forEach(function (k) {
                reqBody[k] = $editProdForm.find(`#${k}`).val()
            })
            const img = $prodImgInput.prop('files')[0]
            if (img) {
                reqBody.img = img.name
            }
            const resp = await service.put(`/product/${prod.id}`, reqBody)
            $editProdForm.off('submit')
            cb(reqBody)
            $prodModal.modal('hide')
            appendProd(resp.data.product)
        })
    }

    async function getProds() {
        const resp = await service.get('/product')
        resp.data.products.forEach(appendProd)
    }

    function appendProd(prod) {
        const { id, name, description, price, img, type } = prod
        const $product = $(`<div class='product list-group-item' id='prod-${id}'>
                </div>`)
        const $prodImg = $(`<img width=100 height=100 class='product-img'>`)
        if (img) {
            $prodImg.attr({ src: service.getUri().concat(prod.img) })
        }
        const $prodMenu = $(`
                <div class="product-dropdown">
                    <i class="product-action fa fa-wrench"></i>
                    <div class="product-dropdown-content"></div>
                </div>
            `)
        const $prodText = $(`<div class="mx-4 flex-grow-1"></div> `)
        const $prodName = $(`<h4 class="mb-1 product-name">${name}</h4>`)
        const $prodDesc = $(`<p class='product-description'>${description}</p>`)
        const $prodPrice = $(`<h5 class='product-price mt-2'>${price}$</h5> `)
        const $editBtn = $(`<div><p>Edit</p></div>`)
        const $deleteBtn = $(`<div><p>Delete</p></div>`)

        $deleteBtn.click(deleteProd.bind(prod))
        $editBtn.click(function () {
            editProd(prod, function ({ name, description, price }) {
                $prodName.text(name)
                $prodDesc.text(description)
                $prodPrice.text(price)
            })
        })

        $prodMenu.find('.product-dropdown-content').append([$editBtn, $deleteBtn])
        $prodText.append([$prodName, $prodDesc, $prodPrice])
        $product.append([
            $prodImg,
            $prodText,
            ...(isAdmin ? [$prodMenu] : [])
        ])

        const $existedEl = $(`#prod-${id}`)

        if ($existedEl.length) {
            $existedEl.replaceWith($product)
            return;
        }

        if (type === 'Breakfast') {
            $('#breakfast-tab-pane .products-container').append($product)
        }
        else if (type === 'Dinner') {
            $('#dinner-tab-pane .products-container').append($product)
        }
        else {
            $('#lunch-tab-pane .products-container').append($product)
        }
    }
})