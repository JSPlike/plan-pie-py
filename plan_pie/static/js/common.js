function getCSRFToken() {
    return document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
}

// 공통 AJAX 전송 함수
function post(url, data, onSuccess, onError) {
    $.ajax({
        url: url,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        headers: {
            'X-CSRFToken': getCSRFToken()
        },
        success: onSuccess,
        error: onError
    });
}

function showConfirmPopup(message, onConfirm) {
    $('#confirm-message').text(message);
    $('#confirm-popup').removeClass('hidden');

    console.log(message);
    const handleYes = () => {
        cleanup();
        if (onConfirm) onConfirm(); // 확인 콜백 실행
    };
    
    const handleNo = () => {
        cleanup();
    };
    
    const cleanup = () => {
        $('#confirm-popup').addClass('hidden');
        $('#confirm-yes').off('click', handleYes);
        $('#confirm-no').off('click', handleNo);
    };
    
    // 기존 이벤트 제거 후 새로 등록
    $('#confirm-yes').off('click').on('click', handleYes);
    $('#confirm-no').off('click').on('click', handleNo);
}
