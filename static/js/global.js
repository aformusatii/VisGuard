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

const copyToClipboard = function(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showInfo('URL copied to clipboard');
        }).catch(err => {
            showError('Oops, unable to copy' + err);
        });
    } else {
        // Fallback method for older browsers or when API is not available
        const textArea = document.createElement('textarea');
        textArea.value = text;

        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showInfo('URL copied to clipboard');
        } catch (err) {
            showError('Oops, unable to copy' + err);
        }
        document.body.removeChild(textArea);
    }
}
