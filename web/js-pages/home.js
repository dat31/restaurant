$(async function () {

    const reps = await service.get('/chef')

    reps.data.chefs.slice(0, 3).forEach(function (c) {
        $('.chefs-slide').append(getChefEl(c))
    })

    function getChefEl(chef) {
        const { img, name } = chef
        return $(`
        <div class="col-lg-4">
            <div class="chef-item">
                <div class="thumb">
                    <div class="overlay"></div>
                    <ul class="social-icons">
                        <li><a href="#"><i class="fa fa-facebook"></i></a></li>
                        <li><a href="#"><i class="fa fa-twitter"></i></a></li>
                        <li><a href="#"><i class="fa fa-instagram"></i></a></li>
                    </ul>
                    <img src='${service.getUri().concat(img)}' alt="Chef">
                </div>
                <div class="down-content">
                    <h4>${name}</h4>
                    <span>Pastry Chef</span>
                </div>
            </div>
        </div>
        `)
    }

})