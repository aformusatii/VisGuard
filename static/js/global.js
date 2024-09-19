$.notify.defaults({
    globalPosition: 'bottom left'
});

const showInfo = function(msg) {
    $('.notifyjs-wrapper').trigger('notify-hide');
    $.notify(msg, 'success');
}

const showError = function(msg) {
    $('.notifyjs-wrapper').trigger('notify-hide');
    $.notify(JSON.stringify(msg, null, 2), 'error');
}

const resizeHandler = function() {
    const height = window.innerHeight;
    //console.log('height', height);

    const menuAndPlayerHeight = $('div.menu-and-player-box').height();
    //console.log('menuAndPlayerHeight', menuAndPlayerHeight);

    const bottomSpaceLeft = height - menuAndPlayerHeight;
    if (bottomSpaceLeft > 200) {
        $('div.timeline-box').css('max-height', bottomSpaceLeft - 20);
    }
}

$(function() {
    const resizeObserver = new ResizeObserver(resizeHandler);
    resizeObserver.observe(document.body);

    window.addEventListener('resize', resizeHandler, true);
});

const isSet = function(value) {
    return value !== null && typeof value !== 'undefined';
}

const isNotSet = function(value) {
    return value === null || typeof value === 'undefined';
}
