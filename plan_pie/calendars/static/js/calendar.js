// HTML이 전부 로드된 이후에 스크립트 정의
document.addEventListener("DOMContentLoaded", function () {
    const today = new Date();
    lucide.createIcons();  // 아이콘 렌더링
    const csrftoken = getCookie('csrftoken');
    let selectedDate = null; // 선택되어진 날짜
    let currentYear = today.getFullYear();  // 현재 화면의 년수
    let currentMonth = today.getMonth(); // 현재 화면의 월수

    const calendarEl = document.getElementById("calendar");
    const calendarYm = document.querySelector(".calendar-ym");
    
    const countryCode = 'KR';
    let showHolidays = true;
    let holidayDates = {}; // 공휴일 날짜 저장용
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const eventsJson = JSON.parse(document.getElementById('events_json').textContent);
    const holidaysJson = JSON.parse(document.getElementById('holidays-data').textContent); 

    // 초기 날짜 선택시 데이터를 임시로 가지고 있는다.
    let initialTitle = 'New Event'; // 초기 값 저장
    let initialStaDt = selectedDate; // 초기 날짜 저장
    let initialEndDt = selectedDate; // 초기 날짜 저장
    let initialAllday = true;
    let initialColor = '#000000';
    let initialInvite = null;


    // TEST 달력 테마를 위한 테스트 데이터
    const calendars = ['개인 일정']; // 예시 데이터
    const calList = document.querySelector('.calList');
    const calButton = document.getElementById('calThem');
    const calAddButton = document.getElementById('btnAddCal');

    // TEST 리스트 동적 생성
    calendars.forEach(name => {
        const li = document.createElement('li');
        li.classList.add('calItem');
        // 저장된 이미지가 있으면 그 이미지 사용 없으면 default
        let imgSrc = "/static/image/no-image-wh.png";
        let check = "/static/image/check.png";

        li.innerHTML = `
            <div class="calImage">
                <img src="${imgSrc}" alt="달력" />
                <div class="overlay">
                    <span>
                        <img class="checkImg" src="${check}"/>
                    </span>
                </div>
            </div>
            
            <div class="calTitle">${name}</div>
        `.trim();

        li.addEventListener('click', () => {
            console.log(`선택한 달력: ${name}`);
            //calList.style.display = 'none'; // 선택 후 닫기
        });

        calList.insertBefore(li, calAddButton);
    });
    
    // TEST 햄버거 버튼 클릭 시 열기/닫기 토글
    calButton.addEventListener('click', function (e) {
        e.stopPropagation(); // 다른 이벤트 방지
        console.log("toggle btn click");
        calList.classList.toggle('show');
    });
    
    // TEST 외부 클릭 시 닫기
    document.addEventListener('click', function (e) {
        if (!calList.contains(e.target)) {
            calList.classList.remove('show');
        }
    });


    // 저장된 이벤트 처리

    // 해당 유저에 저장되어진 이벤트를 가져온다.

    holidaysJson.forEach(event => {
        const dateStr = event.start_time.split(' ')[0]; // 'YYYY-MM-DD'
        
        // holidayDates[dateStr]이 없으면 배열 생성
        if (!holidayDates[dateStr]) {
            holidayDates[dateStr] = [];
        }
    
        // 해당 날짜에 공휴일 이름 추가
        holidayDates[dateStr].push(event.title);
    });

    // 이전달 다음달로 날짜를 변경한다.
    document.getElementById("prev").addEventListener("click", () => renderCalendar(currentYear, currentMonth - 1));
    document.getElementById("next").addEventListener("click", () => renderCalendar(currentYear, currentMonth + 1));

    /**
     * 달력데이터를 갱신및 생성한다.
     * @param {*} year 
     * @param {*} month 
     */
    function renderCalendar(year, month) {
        calendarEl.innerHTML = ""; // 기존 내용 지우기
        calendarYm.innerHTML = "";
        currentYear = year;
        currentMonth = month;
        let isActiveEvent = false;

        const firstDay = new Date(year, month, 1).getDay(); // 월의 첫째 날 요일
        const daysInMonth = new Date(year, month + 1, 0).getDate(); // 월의 총 일수

        let calendarYmHTML = `<span>${year}년 ${month + 1}월</span>`
        let calendarHTML =  `<div class="calendar-grid">`;

        // 요일 헤더 추가
        const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
        weekDays.forEach(day => calendarHTML += `<div class="day-header">${day}</div>`);

        // 첫 주 빈 칸 추가
        for (let i = 0; i < firstDay; i++) {
            calendarHTML += `<div class="empty"></div>`;
        }

        // 날짜 채우기
        for (let day = 1; day <= daysInMonth; day++) {
            const fullDateStr = `${year}-${padMonth(month)}-${padDay(day)}`;
            
            let dayClass = 'day';
            let holidayHTML = '';

            const date = new Date(year, month, day);
            const dayOfWeek = date.getDay();

            // 달력의 날짜가 오늘날짜라면 표시해준다
            if(fullDateStr == todayStr) {   
                dayClass += ' today'
            }
            // 일요일과 토요일 날짜색상을 적용해준다
            if (dayOfWeek === 0) {
                dayClass += ' sunday'
            } else if (dayOfWeek === 6) {
                dayClass += ' saturday'
            }

            // 현재 달에 작성중인 이벤트가 있는지 확인한다.
            if(selectedDate != null && isSameDate(date, selectedDate)) {
                isActiveEvent = true;
                console.log("현재달에 작성중인 이벤트가 있습니다.");
            }

            // 공휴일 체크박스에 체크되어있는경우 실행한다.
            if (showHolidays && holidayDates[fullDateStr]) {
                dayClass += ' holiday';
                holidayHTML = holidayDates[fullDateStr].map(name => 
                    `<button class="dayEventBtn"><span class="dayEventSpan">${name}</span></button>`
                ).join('');
            }



            calendarHTML += `<div class="${dayClass}" data-year="${year}" data-month="${month}" data-day="${day}">
                                <div class="day-number-container"><div class="day-number">${day}</div></div>
                                <div class="holiday-container">${holidayHTML}</div>
                                <div class="day-events-container"></div>
                            </div>`;
        }

        calendarHTML += `</div>`;
        calendarEl.innerHTML = calendarHTML;
        calendarYm.innerHTML = calendarYmHTML;

        // 달력의 이벤트 및 요소들 초기 세팅
        initWindow();

        if(isActiveEvent) {
            let title = $('#event-title').val()?.trim() || 'New Event';

            drawEvent(title, selectedDate);
        }
    }

    renderCalendar(today.getFullYear(), today.getMonth());

    function initWindow() {
        // 시간 요소를 숨긴다.
        $('.time-input').css('visibility', 'hidden');

        // 렌더링시 해당 년월을 달력 인풋창의 기본으로 사용한다.

        // 렌더링시 해당 년월에 존재하는 이벤트를 달력에 그려준다.
        /*
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);
        
        // 시작일 데이터 부터 종료일 데이터 까지 읽어서 해당 이벤트를 그려준다.
        for(let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const year = d.getFullYear();
            const month = d.getMonth() + 1; // 월은 0부터 시작
            const day = d.getDate();

            const container = document.querySelector(
                `[data-year="${year}"][data-month="${month}"][data-day="${day}"]`
            );
            
            const eventContainer = container.querySelector('.day-events-container');

            
            // 만약 추가해야할 이벤트 해당 날짜에 대해 위에 휴일이 있거나 첫번째 이벤트가 아닐경우에는 상단마진 2px 설정
            const hasHoliday = container.querySelector('.holiday-container')?.innerHTML.trim() !== ''; // 휴일 요소
            const existingEvents = container.querySelectorAll('.event-item').length > 0; // 이벤트 요소


            if (eventContainer) {
                const eventDiv = document.createElement('div');
                eventDiv.classList.add('event-item');
                eventDiv.style.backgroundColor = color;

                if(hasHoliday || existingEvents) {
                    eventDiv.style.marginTop = '2px';
                }

                // 시작일만 시간 표시
                const label = `${title}`

                eventDiv.innerHTML = label;
                eventContainer.appendChild(eventDiv);
            }
        }
        */

    }

    /**
     * 메인사이즈 조정 및 사이드 섹션을 호출한다
     */
    function onEventForm() {
        $('.right-section').removeClass('slide-out-right');
        $('.right-section').removeClass('hidden-slide');
        $('.centerSection').removeClass('expand-main');
        $('.centerSection').addClass('shirink-main');
    }

    /**
     * 메인사이즈 조정 및 사이드섹션을 닫는다.
     */
    function offEventForm() {
        $('.right-section').addClass('slide-out-right');
        $('.right-section').addClass('hidden-slide');
        $('.centerSection').removeClass('shirink-main');
        $('.centerSection').addClass('expand-main');
    }

    /**
     * 일정 생성 섹션을 호출한다
     */
    $('#toggleEvent').on('click', function() {
        onEventForm()
    });

    /**
     * 일정 생성 섹션을 닫는다
     */
    $('#close-section-btn').on('click', function () {
        // 변경된 값이 있는지 체크할 필요가 있다.

        showConfirmPopup("정말 취소하시겠습니까?", function () {
            const existingEventItems = document.querySelectorAll('.new-event-item');
            existingEventItems.forEach(item => item.remove());
            selectedDate = null;
            offEventForm();
        });
    });

    function getClickedDate(el) {
        const year = $(el).data('year');
        const month = $(el).data('month');
        const day = $(el).data('day');
        return new Date(year, month, day);
    }
    
    function formatDate(date) {
        return `${date.getFullYear()}-${padMonth(date.getMonth())}-${padDay(date.getDate())}`;
    }
    
    function setFocusOnDay(el) {
        $('.day').removeClass('focused');
        $(el).addClass('focused');
    }
    
    function updateFlatpickr(date) {
        const formatted = formatDate(date);
        $('#start-date').val(formatted);
        $('#end-date').val(formatted);
        $('#start-date')[0]._flatpickr.setDate(date, true);
        $('#end-date')[0]._flatpickr.setDate(date, true);
    }

    function handleDayClick() {
        const clickedDate = getClickedDate(this);
        selectedDate = clickedDate;
    
        setFocusOnDay(this);
    }
    
    function handleDayDblclick() {
        onEventForm();
    
        const clickedDate = getClickedDate(this);
        selectedDate = clickedDate;
    
        updateFlatpickr(clickedDate);
    
        drawEvent("New Event", clickedDate);
    }


    /**
     * 캘린더에서 특정 날짜를 클릭했을때 이벤트를 발생시킨다
     */
    
    function handleDayClick1 () {
        onEventForm();

        // 클릭한 개체를 탐지한다. 날짜 값을 받는다.
        const year = $(this).data('year');
        const month = $(this).data('month');
        const day = $(this).data('day');

        // 현재 클릭한 날짜데이터
        // javascript에서 0은 1월로 표현된다.
        const clickedDate = new Date(year, month, day);

        selectedDate = clickedDate;
        const format = (date) => `${date.getFullYear()}-${padMonth(date.getMonth())}-${padDay(date.getDate())}`;

        // 1. 모든 날짜 포커스 해제
        document.querySelectorAll('.day').forEach(d => d.classList.remove('focused'));

        // ✅ 1. 기존 포커스 해제
        $('#calendar .day.focused').removeClass('focused');

        // ✅ 2. 현재 클릭된 요소에 포커스 클래스 추가
        $(this).addClass('focused');
    }


    function handleDayDblclick1 () {
        onEventForm();

        // 클릭한 개체를 탐지한다. 날짜 값을 받는다.
        const year = $(this).data('year');
        const month = $(this).data('month');
        const day = $(this).data('day');

        // 현재 클릭한 날짜데이터
        // javascript에서 0은 1월로 표현된다.
        const clickedDate = new Date(year, month, day);

        selectedDate = clickedDate;
        const format = (date) => `${date.getFullYear()}-${padMonth(date.getMonth())}-${padDay(date.getDate())}`;

        // 1. 모든 날짜 포커스 해제
        document.querySelectorAll('.day').forEach(d => d.classList.remove('focused'));

        // ✅ 1. 기존 포커스 해제
        //$('#calendar .day.focused').removeClass('focused');

        // ✅ 2. 현재 클릭된 요소에 포커스 클래스 추가
        //$(this).addClass('focused');

        // 초기 날짜 세팅 (둘다 오늘날짜)
        $('#start-date').val(format(clickedDate));
        $('#end-date').val(format(clickedDate));

        // 3. flatpickr 인스턴스에 날짜 반영
        $('#start-date')[0]._flatpickr.setDate(clickedDate, true);  // true는 onChange 트리거 포함
        $('#end-date')[0]._flatpickr.setDate(clickedDate, true);

        /* 선택된 날짜에 New Event 박스 생성 */
        drawEvent("New Event", clickedDate)
    }

    /**
     * 캘린더 내부에서 날짜를 클릭시 해당 이벤트가 실행된다.
     */
    $('#calendar').on('click', '.day', handleDayClick);
    $('#calendar').on('dblclick', '.day', handleDayDblclick);
    /**
     * 달력화면에 해당 이벤트를 그려준다.
     */
    function drawEvent(title, d) {
        // 기존에 이미 새 이벤트 아이템이 있으면 지워준다.
        const existingEventItems = document.querySelectorAll('.new-event-item');
        existingEventItems.forEach(item => item.remove());
        
        // 클릭한 날짜에 대한 정보
        const year = d.getFullYear();
        const month = d.getMonth(); // 월은 0부터 시작
        const day = d.getDate();

        const container = document.querySelector(
            `[data-year="${year}"][data-month="${month}"][data-day="${day}"]`
        );

        console.log(container);
        
        const eventContainer = container.querySelector('.day-events-container');
        
        // 만약 추가해야할 이벤트 해당 날짜에 대해 위에 휴일이 있거나 첫번째 이벤트가 아닐경우에는 상단마진 2px 설정
        const hasHoliday = container.querySelector('.holiday-container')?.innerHTML.trim() !== ''; // 휴일 요소
        const existingEvents = container.querySelectorAll('.new-event-item').length > 0; // 이벤트 요소

        if (eventContainer) {
            const eventDiv = document.createElement('button');
            const eventSpan = document.createElement('span');
            eventSpan.classList.add('dayEventSpan');
            eventDiv.classList.add('new-event-item');

            // 선택중인 색상
            const color = $('#event-color-select').val();

            eventDiv.style.backgroundColor = color;

            if(hasHoliday || existingEvents) {
                console.log("margin 2px 발생")
                eventDiv.style.marginTop = '2px';
            }

            // 시작일만 시간 표시
            const label = `${title}`
            eventSpan.innerHTML = label;
            // 구조 조립
            eventDiv.appendChild(eventSpan);
            eventContainer.appendChild(eventDiv);
        }
    }

    flatpickr("#start-date", {
        dateFormat: "Y-m-d",
        defaultDate: new Date(),
        allowInput: false,
        onChange: function (selectedDates, dateStr, instance) {
            // 만약 선택된 날짜가 종료일보다 뒤라면 종료일도 같은 날짜로 맞춰준다.
            if( $('#start-date').val() > $('#end-date').val() ) {
                $('#end-date').val(dateStr);
                $('#end-date')[0]._flatpickr.setDate(dateStr, true);
                $('#end-date').removeClass('invalid-data');
            }
        }
    });

    flatpickr("#end-date", {
        dateFormat: "Y-m-d",
        defaultDate: new Date(),
        allowInput: false,
        onChange: function (selectedDates, dateStr, instance) {
            // 만약 선택된 날짜가 시작일보다 앞이라면 불가능 하다는 표시가 필요
            if( $('#start-date').val() > $('#end-date').val() ){
                $('#end-date').addClass('invalid-data');
            }
        }
    });

    flatpickr("#birthDate", {
        dateFormat: "Y-m-d",
        altInput: true,
        altFormat: "Ymd",
        defaultDate: null,
        allowInput: true,
        maxDate: "today",  // 오늘 날짜 이후는 선택할 수 없도록 제한
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
     * 태그 색상 변경 이벤트
     */
    $('#event-color-select').on('change', function () {
        const selectedColor = $(this).val();

        $('.option-section .icon').css('stroke', selectedColor);
        $('.new-event-item').css('background', selectedColor);
    });

    /**
     * 일정 저장 로직
     */
    $('#save-section-btn').on('click', function() {
        // 유효성확인
        if(saveValidate() == false) { return; }

        if (confirm("저장하시겠습니까?")) {
            const formData = {};
            $('#custom-event-form').find('input, select, textarea').each(function () {
                const name = $(this).attr('name');
                let value;
        
                if ($(this).attr('type') === 'checkbox') {
                    value = $(this).is(':checked');
                } else {
                    value = $(this).val();
                }
        
                if (name) {
                    formData[name] = value;
                }
            });

            const participants = [];

            $('#participant-list span').each(function () {
                const email = $(this).data('email');
                if (email) {
                    participants.push(email);
                }
            });

            formData['participants'] = participants;

            // JSON으로 출력 확인 (디버깅용)
            console.log(JSON.stringify(formData));

            console.log("이벤트 저장로직 실행 =======>");
            // post send (url, data, onSuccess, onError)
            post (
                '/event/new/', 
                formData,
                function (res) {

                    console.log(res);
                    // 성공했으면 화면에 그려주는 로직
                    //drawEvent(res.title, res.color, res.start_date, res.end_date)

                    // 화면에 반영해주는 로직필요
                },
                function (xhr, status, error) {
                    console.error('저장 실패:', error);
                }
            );
        }
    });

    function saveValidate() {
        if($('#event-title').val().trim() === "") {
            alert("제목을 입력해주세요.");
            $('#event-title').focus();
            return false;
        }

        if($('#start-date').val().trim === "") {
            alert("시작일을 입력해주세요.");
            $('#start-date').focus();
            return false;
        }

        if($('#end-date').val().trim === "") {
            alert("종료을 입력해주세요.");
            $('#end-date').focus();
            return false;
        }

        // 종일 체크박스에 체크해제 되어있는 경우
        if($('#all-day')) {
            if($('#start-time').val().trim === "") {
                alert("시작시간을 입력해주세요.");
                $('#start-time').focus();
                return false;
            }

            if($('#end-time').val().trim === "") {
                alert("종료시간을 입력해주세요.");
                $('#end-time').focus();
                return false;
            }
        }

        return true;
    }


    function padMonth(m) {
        return String(m + 1).padStart(2, '0');
    }

    function padDay(d) {
        return String(d).padStart(2, '0');
    }

    /**
     * 두 Date객체의 날짜를 비교한다.
     * 같으면 true 다르면 false
     */
    function isSameDate (d1, d2) {
        return d1.getFullYear() === d2.getFullYear() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getDate() === d2.getDate();
    };





    // 참여자 검색
    $('#search-input').on('input', function () {
        const searchQuery = $(this).val().trim();
        const searchResults = $('#search-results');
        
        if (searchQuery) {
            // 가상 사용자 목록 (서버에서 데이터 가져오는 경우 해당 부분 수정)
            const users = [
                { id: 'joonyoung', email: 'joonyoung@potato.co.kr', name: '박준영', profileImg: 'https://example.com/profile/joonyoung.jpg' },
                { id: 'Esunsin', email: 'Esunsin@potato.co.kr', name: '이순신', profileImg: 'https://example.com/profile/Esunsin.jpg' },
                { id: 'newUser', email: 'newuser@potato.co.kr', name: '김유신', profileImg: 'https://example.com/profile/newUser.jpg' }
            ];

            // 사용자 목록에서 검색어와 일치하는 아이디를 가진 사용자 찾기
            const filteredUsers = users.filter(user => user.id.includes(searchQuery));

            searchResults.empty(); // 검색 결과 초기화

            if (filteredUsers.length > 0) {
                filteredUsers.forEach(user => {
                    const resultItem = $(`<div class="search-result-item" data-email="${user.email}">
                        <img src="${user.profileImg}" alt="${user.name}" class="participant-img">
                        <span>${user.name}</span>
                    </div>`);
                    searchResults.append(resultItem);
                });
                searchResults.show(); // 검색 결과 표시
            } else {
                searchResults.append('<p>검색 결과가 없습니다.</p>');
                searchResults.show();
            }
        } else {
            searchResults.empty();
            searchResults.hide(); // 검색어가 비었을 때는 결과 숨기기
        }
    });

    // 검색 결과 항목을 클릭하면 참여자 목록에 추가
    $(document).on('click', '.search-result-item', function () {
        const email = $(this).data('email');
        const name = $(this).find('span').text();
        const profileImg = $(this).find('img').attr('src');

        const newParticipant = $(`<div class="participant" data-email="${email}">
            <img src="${profileImg}" alt="${name}" class="participant-img">
            <span>${name}</span>
        </div>`);

        $('#participant-list').append(newParticipant); // 참여자 목록에 추가
        $('#search-input').val(''); // 검색 입력창 초기화
        $('#search-results').empty().hide(); // 검색 결과 숨기기
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
        /*
        if(!modalContent.contains(e.target)) {
            $('#modalProfileEdit').hide();
            $('#nickname').val('');  // Clear the value of the nickname input
            $('#email').val('');     // If you have an email field, clear it too
        }
            */
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
