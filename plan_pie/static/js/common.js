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
            'X-CSRFToken': getCookie('csrftoken')
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

/**
 * Modal화면을 호출한다.
 */
function openModal(theme) {
    const modalTheme = document.getElementById("modal-theme");
    const modalTitle = document.getElementById("modal-title");
    const calendarTheme = document.getElementById("calendarTheme");
    const shareSettingsContainer = document.getElementById("shareSettingsContainer");

    // 모달 설정
    //modal.classList.remove("hidden");
    $('#calendar-modal').css('display', 'flex');
    modalTheme.value = theme;
    console.log("모달 오픈 버튼 클릭");

    if (theme === "personal") {
        console.log("개인 캘린더 생성화면 오픈");
        modalTitle.textContent = "📅 개인 캘린더 생성";
        calendarTheme.value = 'personal';
    } else {
        console.log("공유 캘린더 생성화면 오픈");
        modalTitle.textContent = "👥 공유 캘린더 생성";
        shareSettingsContainer.style.display = 'block';
        calendarTheme.value = 'team';
    }
}

function closeModal() {
    document.getElementById("calendar-modal").classList.add("hidden");
}

$(document).on('click', '#btnModalClose', function() {
    var modal = $(this).closest('.modal');
    // 모달 내의 폼 초기화
    resetModalForm(modal);
    // 모달 닫기
    modal.hide();
});

/**
 * 모달 내용을 저장한다.
 */
$(document).on('click', '#btnModalSave', function() {

    // 모달 ID 가져오기
    var modalId = $(this).closest('.modal').attr('id');

    console.log(modalId);
    // 각 모달별 저장 동작 처리
    handleModalSave(modalId);
});

// 모달별 저장 동작 처리 함수
function handleModalSave(modalId) {
    // 모달별 다른 동작 구현
    switch(modalId) {
        case 'calendar-modal':
            saveCalendarData();
            break;
        default:

        // 기본 저장 동작
        saveDefaultData();
    }
}

/**
 * 유저 프로필 사진을 변경한다.
 */
$('#calendarImageInput').on('change', function (e) {

    console.log('파일선택버튼');
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            $('#currentCalendarImage').attr('src', e.target.result); // 미리보기만
        };
        reader.readAsDataURL(file);

        // 파일은 FormData에 저장만 해둠 (저장 버튼 누를 때 전송)
        $('#calendarImageInput')[0].dataset.fileSelected = 'true';
    }
});



function saveCalendarData() {
    const calendarName = $('#calendar-modal input[name="calendarName"]').val();
    const fileInput = $('#calendarImageInput')[0]; // 캘린더 사진
    const calendarTheme = $('#calendarTheme').val();

    const formData = new FormData();

    formData.append('calendar_name', calendarName); // 캘린더 명

    if (fileInput.files[0]) {
        formData.append('calendar_image', fileInput.files[0]);
    }

    formData.append('theme', calendarTheme);

    var $modal = $(this).closest('.modal');

    $modal.hide();
    showToast('캘린더를 저장하는 중...', 'info');

    // Ajax 요청 예시
    $.ajax({
        url: '/calendar/create/',
        method: 'POST',
        data: formData,
        processData: false,  // FormData는 자동으로 처리되지 않으므로 false로 설정
        contentType: false,  // 파일 업로드 시 content-type을 자동으로 설정하지 않도록 설정
        headers: { 'X-CSRFToken': getCookie('csrftoken') },
        success: function(response) {
            // 모달 내의 폼 초기화
            resetModalForm($modal);
            showToast('캘린더가 성공적으로 저장되었습니다!', 'info');
            setTimeout(() => window.location.href = '/calendar/', 300);
        },
        error: function() {
            alert('캘린더 저장 실패!');
        }
    });
}

function showToast(message, type) {
    const toast = $(`
        <div class="toast ${type}" style="
            position: fixed; bottom: 20px; right: 20px; 
            padding: 15px 20px; z-index: 9999;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'}; 
            color: white; border-radius: 5px;
        ">${message}</div>
    `);
    
    $('body').append(toast);
    setTimeout(() => toast.fadeOut(() => toast.remove()), 3000);
}

$('#btnAddEmail').on('click', function() {
        addEmailToList();
});

// 이메일 입력 필드에서 Enter 키 처리
$('#shareEmailInput').on('keypress', function(e) {
    if (e.which === 13) { // Enter key
        e.preventDefault();
        addEmailToList();
    }
});

// 이메일 삭제 (동적으로 생성되는 요소이므로 이벤트 위임 사용)
$('#sharedEmailsList').on('click', '.btn-remove', function() {
    $(this).closest('.email-item').remove();
    updateHiddenEmailsInput();
});

// 저장 버튼 클릭 시 이메일 목록을 hidden input에 설정
$('#btnModalSave').on('click', function() {
    updateHiddenEmailsInput();
});

// 이메일 추가 함수
function addEmailToList() {
    const email = $('#shareEmailInput').val().trim();
    const defaultPermission = $('#defaultPermission').val();
    
    // 유효성 검사
    if (!email) {
        alert('이메일을 입력해주세요.');
        return;
    }
    
    if (!isValidEmail(email)) {
        alert('올바른 이메일 형식이 아닙니다.');
        return;
    }
    
    // 중복 검사
    if (isEmailAlreadyAdded(email)) {
        alert('이미 추가된 이메일입니다.');
        return;
    }
    
    // 이메일 아이템 HTML 생성
    const emailItemHtml = `
        <div class="email-item" data-email="${email}" data-permission="${defaultPermission}">
            /span class="email-text">${email}</span>
            <button type="button" class="btn-remove" title="삭제">×</button>
        </div>
    `;
    
    // 목록에 추가
    $('#sharedEmailsList').append(emailItemHtml);
    
    // 입력 필드 초기화
    $('#shareEmailInput').val('');
    
    // hidden input 업데이트
    updateHiddenEmailsInput();
}

// 이메일 유효성 검사
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// 중복 이메일 검사
function isEmailAlreadyAdded(email) {
    let exists = false;
    $('#sharedEmailsList .email-item').each(function() {
        if ($(this).data('email') === email) {
            exists = true;
            return false; // break
        }
    });
    return exists;
}

// hidden input에 이메일 목록 업데이트
function updateHiddenEmailsInput() {
    const emails = [];
    $('#sharedEmailsList .email-item').each(function() {
        emails.push({
            email: $(this).data('email'),
            permission: $(this).data('permission')
        });
    });
    $('#sharedEmails').val(JSON.stringify(emails));
}

// 공유 이메일 목록 초기화
function clearSharedEmails() {
    $('#sharedEmailsList').empty();
    $('#shareEmailInput').val('');
    $('#sharedEmails').val('');
}

// 모달 열기 시 초기화
function openCalendarModal(isEdit = false, calendarData = null) {
    if (isEdit && calendarData) {
        // 편집 모드
        $('#modal-title').text('캘린더 편집');
        $('#calendarName').val(calendarData.name);
        
        // 공유 캘린더인 경우 이메일 목록 로드
        if (calendarData.type === 'shared') {
            $('#sharedCalendar').prop('checked', true);
            $('#shareSettingsContainer').show();
            
            if (calendarData.sharedEmails) {
                loadExistingEmails(calendarData.sharedEmails);
            }
        }
    } else {
        // 새 생성 모드
        $('#modal-title').text('캘린더 생성');
        $('#personalCalendar').prop('checked', true);
        $('#shareSettingsContainer').hide();
        clearSharedEmails();
    }
    
    $('#calendar-modal').show();
}


// 폼 초기화 함수
function resetModalForm($modal) {
    // 모달 내의 모든 폼 요소 찾기
    var $form = $modal.find('form');

    if ($form.length) {
        // 폼이 있으면 리셋
        $form[0].reset();
        
        // select2 등 특수 입력 요소 초기화
        $modal.find('select').val('').trigger('change');
        
        // 파일 입력 필드 초기화
        $modal.find('input[type="file"]').val('');
        
        // 동적으로 추가된 오류 메시지 제거
        $modal.find('.is-invalid').removeClass('is-invalid');
        $modal.find('.invalid-feedback').remove();
        
        // 체크박스, 라디오 버튼 초기 상태로
        $modal.find('input[type="checkbox"], input[type="radio"]').prop('checked', false);
        
        // 숨겨진 필드 등 추가 초기화가 필요한 요소들
        $modal.find('input[type="hidden"]').val('');
        
        // 텍스트 에디터 초기화 (예: CKEditor, TinyMCE 등 사용 시)
        if (typeof CKEDITOR !== 'undefined') {
        $modal.find('textarea').each(function() {
            var editorId = $(this).attr('id');
            if (CKEDITOR.instances[editorId]) {
            CKEDITOR.instances[editorId].setData('');
            }
        });
        }
        
        // 미리보기 이미지 초기화
        $modal.find('.preview-image').attr('src', '').hide();
    }

    // 폼이 없는 경우에도 입력 요소 초기화
    else {
        $modal.find('input:not([type="button"]):not([type="submit"]):not([type="reset"]), textarea').val('');
        $modal.find('select').val('').trigger('change');
        $modal.find('input[type="checkbox"], input[type="radio"]').prop('checked', false);
    }
}
