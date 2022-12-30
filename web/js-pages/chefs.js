$(function () {

    hideLoader()
    getChefs()
    handleSearchChef()

    function hideLoader() {
        $("#preloader").animate({
            'opacity': '0'
        }, 600, function () {
            setTimeout(function () {
                $("#preloader").css("visibility", "hidden").fadeOut();
            }, 300);
        });
    }

    function handleSearchChef() {
        $('#chef-search-input').on('input', function () {
            const search = $(this).val()
            $('.chef').each(function (_, el) {
                if ($(el).find('.chef-name').text().toLowerCase().includes(search)) {
                    $(el).show()
                } else {
                    $(el).hide()
                }
            })
        })
    }

    function deleteChef() {
        const chefId = this.id
        $("#confirm-modal").modal('show')
        $("#confirm-delete-btn")
            .on('click', async function () {
                await service.delete('/chef/'.concat(chefId))
                $(`.chefs-container #chef-${chefId}`).remove()
                $(this).off('click')
            })
    }

    async function getChefs() {
        const resp = await service.get('/chef')
        const { chefs } = resp.data

        chefs.forEach(c => {
            const { img, name, introduction, phoneNumber, id } = c
            const $chef = $(`
            <div class="card border-0 bg-light chef" id='chef-${id}'>
                <img class="card-img-top" src="${service.getUri().concat(img)}" alt="Card image cap">
                <div class="card-body">
                    <h5 class="card-title chef-name">${name}</h5>
                    <p class="phone-number">${phoneNumber}</p>
                    <p class="card-text chef-intro">${introduction}</p>
                    <div class="d-flex mt-2 btn-container">
                    </div>
                </div>
            </div>
            `)
            const $deleteBtn = $(`<div class="txt-btn py-3">Delete</div>`)
            $chef.find('.btn-container').append([$deleteBtn])
            $deleteBtn.click(deleteChef.bind(c))
            $('.chefs-container').append($chef)
        })
    }

})