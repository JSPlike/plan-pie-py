// static/js/signup.js
$(document).ready(function () {
    $("#signup-form").on('submit', function (e) {
        e.preventDefault();  // 폼 제출 기본 동작을 막음

        // FormData 객체 생성
        let formData = new FormData(this);
        // AJAX 요청 보내기
        $.ajax({
            url: "/accounts/signup/",  // 요청 URL (뷰로 변경 필요)
            method: "POST",
            data: formData,
            processData: false,  // FormData는 자동으로 처리되지 않으므로 false로 설정
            contentType: false,  // 파일 업로드 시 content-type을 자동으로 설정하지 않도록 설정
            headers: {
                "X-Requested-With": "XMLHttpRequest",
                "X-CSRFToken": $("[name=csrfmiddlewaretoken]").val(),  // CSRF 토큰 가져오기
            },
            success: function (data) {
                console.log(data);
                alert(data.message);  // 성공 메시지 표시
                if (data.success) {
                    window.location.href = data.redirect_url;  // 페이지 이동
                }
            },
            error: function (error) {
                console.error("Error:", error);  // 에러 처리
            }
        });
    });

    $('#login-form').on('submit', function(e) {
        e.preventDefault();

        let formData = new FormData(this);
        $.ajax({
            url: "/accounts/login/",
            method: "POST",
            data: formData,
            processData: false,  // FormData는 자동으로 처리되지 않으므로 false로 설정
            contentType: false,  // 파일 업로드 시 content-type을 자동으로 설정하지 않도록 설정
            headers: {
                'X-CSRFToken': '{{ csrf_token }}'
            },
            success: function(res) {
                if (res.success) {
                    window.location.href = res.redirect_url;
                } else {
                    $('#message').html('<p style="color:red;">' + res.message + '</p>');
                }
            },
            error: function() {
                $('#message').html('<p style="color:red;">서버 오류</p>');
            }
        });
    });
});
