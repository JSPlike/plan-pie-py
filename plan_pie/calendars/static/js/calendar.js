// HTML이 전부 로드된 이후에 스크립트 정의
document.addEventListener("DOMContentLoaded", function () {
    const today = new Date();
    lucide.createIcons();  // 아이콘 렌더링
    const csrftoken = getCookie('csrftoken');

    let currentYear = today.getFullYear();  // 현재 화면의 년수
    let currentMonth = today.getMonth(); // 현재 화면의 월수

    // 이전달 다음달로 날짜를 변경한다.
    if(document.getElementById("prev")) {
        document.getElementById("prev").addEventListener("click", () => renderCalendar(currentYear, currentMonth - 1));
    }

    if(document.getElementById("next")) {
        document.getElementById("next").addEventListener("click", () => renderCalendar(currentYear, currentMonth + 1));
    }

    // 입력할 때마다 실행
    $('#event-title').on('input', function(e) {
        const title = e.target.value;

        $('.newEventSpan').text(title);
    });

    // 종일 체크박스 toggle
    $('#all-day').on('change', function () {
        if ($(this).is(':checked')) {
            console.log("종일 체크")
            $('.time-input').css('visibility', 'hidden');
        } else {
            console.log("종일 체크해제")
            $('.time-input').css('visibility', 'visible');
        }
    });

    /**
     * 사용자 프로필을 클릭시 이벤트가 발생한다.
     */
    const profile = document.getElementById("profile");
    const card = document.getElementById("profileCard");
    const settingsBtn = document.getElementById('settingsBtn');
    const dropdown = document.getElementById('settingsDropdown');
    const modalContent = document.getElementById('modalProfileEdit');

    $(document).on('click', '#profile', function() {
        card.classList.toggle("active");
    });

    $(document).on('click', '#settingsBtn', function() {
        dropdown.classList.toggle("active");
    });

    $(document).on('click', function (e) {
        if (!profile.contains(e.target) &&!card.contains(e.target)) {
            card.classList.remove("active");
        }

        if (!settingsBtn.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove("active");
        }
    });

    // 모달
    $('.settings-dropdown a[data-modal]').on('click', function (e) {
        e.preventDefault();
        const targetModalId = $(this).data('modal');
        card.classList.toggle("active");
        dropdown.classList.toggle("active");
        console.log(targetModalId);
        // 모든 모달 닫고
        $('#modalProfileEdit').hide();

        // 타겟 모달만 열기
        $('#' + targetModalId).css('display', 'flex');
    });

    // 취소버튼 클릭
    $('#close-modal-btn').on('click', function () {
        console.log('clicked cancle button')
        $('#modalProfileEdit').hide();
        $('#profileForm')[0].reset();  // 폼의 값 초기화
        //$('#currentProfilePhoto').attr('src', '/static/image/user.png');  // 기본 이미지로 초기화

        $('#nickname').val('');  // Clear the value of the nickname input
        $('#email').val('');     // If you have an email field, clear it too
    });



    /**
     * 유저 프로필 사진을 변경한다.
     */
    $('#profilePhotoInput').on('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                $('#currentProfilePhoto').attr('src', e.target.result); // 미리보기만
            };
            reader.readAsDataURL(file);

            // 파일은 FormData에 저장만 해둠 (저장 버튼 누를 때 전송)
            $('#profilePhotoInput')[0].dataset.fileSelected = 'true';
        }
    });

    /**
     * 유저 프로필 사진을 변경한다.
     */
    $('#calendarImageInput').on('change', function (e) {
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

    /**
     * 유저 프로필 정보를 저장한다.
     */
    $('#save-modal-btn').on('click', function (e) {
        e.preventDefault();  // 폼 기본 동작 막기

        const formData = new FormData();
        formData.append('nickname', $('#nickname').val());
        formData.append('birthDate', $('#birthDate').val());

        const fileInput = $('#profilePhotoInput')[0];

        if (fileInput.files[0]) {
            formData.append('profilePhoto', fileInput.files[0]);
        }

        $.ajax({
            url: '/accounts/update_profile/',
            method: "POST",
            data: formData,
            processData: false,  // FormData는 자동으로 처리되지 않으므로 false로 설정
            contentType: false,  // 파일 업로드 시 content-type을 자동으로 설정하지 않도록 설정
            headers: { 'X-CSRFToken': csrftoken },
            success: function(res) {
                if (res.success) {
                    window.location.href = res.redirect_url;
                    console.log('저장완료 >>')
                    console.log(res);
                } else {
                    console.log(res.status);
                }
            },
            error: function(error) {
                console.error('저장 실패:', error);
            }
        });
    });
});
