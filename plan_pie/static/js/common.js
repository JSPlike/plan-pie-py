function getCSRFToken() {
    return document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            // 쿠키 이름이 일치하면 값 반환
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
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
