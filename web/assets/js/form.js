$(function () {
    $.fn.isValid = function () {
        let validate = true;
        this.each(function () {
            if (this.checkValidity() == false) {
                validate = false;
            }
        });
        return validate
    };
})