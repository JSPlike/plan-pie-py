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
    const leftSection = document.querySelector(".left-section");

    let layoutState = 'default'; // 'default', 'leftExpanded', 'bothExpanded', 'rightExpanded'
    const leftLayout = document.getElementById("left-section");
    const centerLayout = document.getElementById("center-section");
    const rightLayout = document.getElementById("right-section");

    const countryCode = 'KR';
    let showHolidays = true;
    let holidayDates = {}; // 공휴일 날짜 저장용
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    //const eventsJson = JSON.parse(document.getElementById('events_json').textContent);
    const holidaysJson = JSON.parse(document.getElementById('holidays_json').textContent); 

    // 초기 날짜 선택시 데이터를 임시로 가지고 있는다.
    let initialTitle = 'New Event'; // 초기 값 저장
    let initialStaDt = selectedDate; // 초기 날짜 저장
    let initialEndDt = selectedDate; // 초기 날짜 저장
    let initialAllday = true;
    let initialColor = '#000000';
    let initialInvite = null;


    // TEST 달력 테마를 위한 테스트 데이터
    const calendars = document.getElementById('calendars_json') ? JSON.parse(document.getElementById('calendars_json').textContent) : null; 
    const calList = document.querySelector('.calList');
    const calTheme = document.getElementById('calThem');
    const calAddButton = document.getElementById('btnAddCal');

    if(calendars !== null) {
        // TEST 리스트 동적 생성
        calendars.forEach((calendar, index) => {
            const li = document.createElement('li');
            li.classList.add('calItem');
            
            console.log(calendar);

            // 저장된 이미지가 있으면 그 이미지 사용 없으면 default
            let imgSrc = calendar.image || "/static/image/bg-calendar.png";
            let isImg = calendar.image ? true : false;
            let check = "/static/image/check.png" || false;
            let name = calendar.name || "";

            const checkStyle = index === 0 ? 'style="opacity: 1;"' : 'style="opacity: 0;"'

            let calImageHtml = '';

            if(isImg) {
                calImageHtml = `
                    <div class="calContainer small">
                        <img class="calImage" src="${imgSrc}" alt="cal" />
                        <span class="calTitle">${name}</span>
                    </div>
                `
            } else {
                calImageHtml = `
                    <div class="calImage small no-image">
                        <span class="calendar-initial">${name[0] || '?'}</span>
                    </div>
                `
            }


            li.innerHTML = calImageHtml.trim();

            li.addEventListener('click', () => {
                console.log(`선택한 달력: ${name}`);
            });

            calList.insertBefore(li, calAddButton);
        });

        leftSection.append(calList);
    }

    // TEST 햄버거 버튼 클릭 시 열기/닫기 토글
    calTheme.addEventListener('click', function (e) {
        console.log('현재 레이아웃 상태 : ' + layoutState);
        if (layoutState === 'default') {
            expandLeftSection();
        } else if(layoutState === 'rightExpanded') {
            expandBothSection();
        } else if (layoutState === 'bothExpanded') {
            expandRightSection();
        } else {
            resetLayout();
        }

    });
   
    // 레이아웃
    /*
    const LAYOUT_BREAKPOINTS = {
        leftDeft: '70px',
        leftExpd: '300px',
        rightDeft: '0px',
        rightExpd: '400px'
    };

    function updateCalendarItemStates(isExpanded) {
        document.querySelectorAll('.calContainer').forEach(item => {
            item.classList.remove('small', 'large');
            item.classList.add(isExpanded ? 'large' : 'small');
        });


    }

    function expandLeftSection() {
        layoutState = 'leftExpanded';
        leftLayout.style.width = LAYOUT_BREAKPOINTS.leftExpd;
        centerLayout.style.width = `calc(100% - ${LAYOUT_BREAKPOINTS.leftExpd} - ${LAYOUT_BREAKPOINTS.rightDeft})`;
        rightLayout.style.width = LAYOUT_BREAKPOINTS.rightDeft;
        updateCalendarItemStates(true);
    }

    function expandBothSection() {
        layoutState = 'bothExpanded';
        leftLayout.style.width = LAYOUT_BREAKPOINTS.leftExpd;
        centerLayout.style.width = `calc(100% - ${LAYOUT_BREAKPOINTS.leftExpd} - ${LAYOUT_BREAKPOINTS.rightExpd})`;
        rightLayout.style.width = LAYOUT_BREAKPOINTS.rightExpd;
        updateCalendarItemStates(true);
    }

    function expandRightSection() {
        layoutState = 'rightExpanded';
        leftLayout.style.width = LAYOUT_BREAKPOINTS.leftDeft;
        centerLayout.style.width = `calc(100% - ${LAYOUT_BREAKPOINTS.leftDeft} - ${LAYOUT_BREAKPOINTS.rightExpd})`;
        rightLayout.style.width = LAYOUT_BREAKPOINTS.rightExpd;
        updateCalendarItemStates(false);
    }

    function resetLayout() {
        layoutState = 'default';
        leftLayout.style.width = LAYOUT_BREAKPOINTS.leftDeft;
        centerLayout.style.width = `calc(100% - ${LAYOUT_BREAKPOINTS.leftDeft} - ${LAYOUT_BREAKPOINTS.rightDeft})`;
        rightLayout.style.width = LAYOUT_BREAKPOINTS.rightDeft;
        updateCalendarItemStates(false);
    }
    */

    // 레이아웃 상수
    const LAYOUT_BREAKPOINTS = {
        // 데스크톱
        desktop: {
            leftDeft: '70px',
            leftExpd: '300px',
            rightDeft: '0px',
            rightExpd: '400px'
        },
        // 모바일 - 전체 화면
        mobile: {
            leftDeft: '60px',
            leftExpd: '100vw',
            rightDeft: '0px',
            rightExpd: '100vw'
        }
    };

    // 현재 화면이 모바일인지 확인
    function isMobile() {
        return window.innerWidth <= 768;
    }

    function getCurrentBreakpoints() {
        return isMobile() ? LAYOUT_BREAKPOINTS.mobile : LAYOUT_BREAKPOINTS.desktop;
    }

    function updateCalendarItemStates(isExpanded) {
        if (isMobile()) {
            // 모바일에서는 항상 적절한 크기 유지
            document.querySelectorAll('.calContainer').forEach(item => {
                item.classList.remove('small', 'large');
                item.classList.add(isExpanded ? 'large' : 'small');
            });
            return;
        }
        
        // 데스크톱 로직
        document.querySelectorAll('.calContainer').forEach(item => {
            item.classList.remove('small', 'large');
            item.classList.add(isExpanded ? 'large' : 'small');
        });
    }

    function expandLeftSection() {
        const breakpoints = getCurrentBreakpoints();
        
        if (isMobile()) {
            // 모바일: 왼쪽 섹션이 화면 전체 차지
            layoutState = 'leftExpanded';
            
            // 왼쪽 섹션을 전체 화면으로
            leftLayout.style.position = 'fixed';
            leftLayout.style.top = '0';
            leftLayout.style.left = '0';
            leftLayout.style.width = '100vw';
            leftLayout.style.height = '100vh';
            leftLayout.style.zIndex = '1000';
            leftLayout.style.backgroundColor = 'white';
            
            // 다른 섹션들 숨김
            centerLayout.style.display = 'none';
            rightLayout.style.display = 'none';
            
        } else {
            // 데스크톱: 기존 로직
            layoutState = 'leftExpanded';
            leftLayout.style.width = breakpoints.leftExpd;
            centerLayout.style.width = `calc(100% - ${breakpoints.leftExpd} - ${breakpoints.rightDeft})`;
            rightLayout.style.width = breakpoints.rightDeft;
        }
        
        updateCalendarItemStates(true);
    }

    function expandRightSection() {
        const breakpoints = getCurrentBreakpoints();
        
        if (isMobile()) {
            // 모바일: 오른쪽 섹션이 화면 전체 차지
            layoutState = 'rightExpanded';
            
            // 오른쪽 섹션을 전체 화면으로
            rightLayout.style.position = 'fixed';
            rightLayout.style.top = '0';
            rightLayout.style.left = '0';
            rightLayout.style.width = '100vw';
            rightLayout.style.height = '100vh';
            rightLayout.style.zIndex = '1000';
            rightLayout.style.transform = 'translateX(0)';
            rightLayout.classList.add('active');
            
            // 다른 섹션들 숨김
            centerLayout.style.display = 'none';
            leftLayout.style.display = 'none';
            
        } else {
            // 데스크톱: 기존 로직
            layoutState = 'rightExpanded';
            leftLayout.style.width = breakpoints.leftDeft;
            centerLayout.style.width = `calc(100% - ${breakpoints.leftDeft} - ${breakpoints.rightExpd})`;
            rightLayout.style.width = breakpoints.rightExpd;
        }
        
        updateCalendarItemStates(false);
    }

    function expandBothSection() {
        const breakpoints = getCurrentBreakpoints();
        
        if (isMobile()) {
            // 모바일에서는 both expansion을 right expansion으로 처리
            expandRightSection();
            return;
        }
        
        // 데스크톱: 기존 로직
        layoutState = 'bothExpanded';
        leftLayout.style.width = breakpoints.leftExpd;
        centerLayout.style.width = `calc(100% - ${breakpoints.leftExpd} - ${breakpoints.rightExpd})`;
        rightLayout.style.width = breakpoints.rightExpd;
        updateCalendarItemStates(true);
    }

    function resetLayout() {
        const breakpoints = getCurrentBreakpoints();
        
        layoutState = 'default';
        
        if (isMobile()) {
            // 모바일: 모든 것을 원래 상태로
            
            // 왼쪽 섹션 리셋
            leftLayout.style.position = 'relative';
            leftLayout.style.top = 'auto';
            leftLayout.style.left = 'auto';
            leftLayout.style.width = breakpoints.leftDeft;
            leftLayout.style.height = 'auto';
            leftLayout.style.zIndex = 'auto';
            leftLayout.style.display = 'block';
            
            // 오른쪽 섹션 리셋
            rightLayout.style.position = 'relative';
            rightLayout.style.top = 'auto';
            rightLayout.style.left = 'auto';
            rightLayout.style.width = breakpoints.rightDeft;
            rightLayout.style.height = 'auto';
            rightLayout.style.zIndex = 'auto';
            rightLayout.style.transform = 'translateX(100%)';
            rightLayout.classList.remove('active');
            rightLayout.style.display = 'block';
            
            // 중앙 섹션 리셋
            centerLayout.style.width = `calc(100% - ${breakpoints.leftDeft} - ${breakpoints.rightDeft})`;
            centerLayout.style.display = 'block';
            
        } else {
            // 데스크톱: 기존 로직
            leftLayout.style.position = 'relative';
            leftLayout.style.width = breakpoints.leftDeft;
            
            rightLayout.style.position = 'relative';
            rightLayout.style.width = breakpoints.rightDeft;
            
            centerLayout.style.width = `calc(100% - ${breakpoints.leftDeft} - ${breakpoints.rightDeft})`;
        }
        
        updateCalendarItemStates(false);
    }

    // 화면 크기 변경 감지
    function handleResize() {
        if (layoutState !== 'default') {
            resetLayout();
        }
        updateCalendarItemStates(false);
    }

    // 모바일에서 뒤로가기 버튼 추가
    function addMobileBackButton() {
        if (!isMobile()) return;
        
        // 왼쪽 섹션용 뒤로가기 버튼
        if (!leftLayout.querySelector('.mobile-back-btn')) {
            const leftBackBtn = document.createElement('button');
            leftBackBtn.innerHTML = '✕';
            leftBackBtn.className = 'mobile-back-btn left-back';
            leftBackBtn.style.cssText = `
                position: absolute;
                top: 15px;
                right: 15px;
                width: 40px;
                height: 40px;
                border: none;
                background: rgba(255, 255, 255, 0.9);
                border-radius: 50%;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                z-index: 1001;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                display: none;
            `;
            leftBackBtn.addEventListener('click', resetLayout);
            leftLayout.appendChild(leftBackBtn);
        }
        
        // 오른쪽 섹션용 뒤로가기 버튼
        if (!rightLayout.querySelector('.mobile-back-btn')) {
            const rightBackBtn = document.createElement('button');
            rightBackBtn.innerHTML = '✕';
            rightBackBtn.className = 'mobile-back-btn right-back';
            rightBackBtn.style.cssText = `
                position: absolute;
                top: 15px;
                right: 15px;
                width: 40px;
                height: 40px;
                border: none;
                background: rgba(255, 255, 255, 0.9);
                border-radius: 50%;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                z-index: 1001;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                display: none;
            `;
            rightBackBtn.addEventListener('click', resetLayout);
            rightLayout.appendChild(rightBackBtn);
        }
    }

    // 뒤로가기 버튼 표시/숨김
    function showMobileBackButton(section) {
        if (!isMobile()) return;
        
        if (section === 'left') {
            const btn = leftLayout.querySelector('.left-back');
            if (btn) btn.style.display = 'block';
        } else if (section === 'right') {
            const btn = rightLayout.querySelector('.right-back');
            if (btn) btn.style.display = 'block';
        }
    }

    function hideMobileBackButtons() {
        const leftBtn = leftLayout.querySelector('.left-back');
        const rightBtn = rightLayout.querySelector('.right-back');
        
        if (leftBtn) leftBtn.style.display = 'none';
        if (rightBtn) rightBtn.style.display = 'none';
    }

    // 기존 함수들 수정 - 버튼 표시 추가
    const originalExpandLeft = expandLeftSection;
    expandLeftSection = function() {
        originalExpandLeft();
        if (isMobile()) showMobileBackButton('left');
    };

    const originalExpandRight = expandRightSection;
    expandRightSection = function() {
        originalExpandRight();
        if (isMobile()) showMobileBackButton('right');
    };

    const originalReset = resetLayout;
    resetLayout = function() {
        originalReset();
        hideMobileBackButtons();
    };

    // 이벤트 리스너
    window.addEventListener('resize', handleResize);

    // ESC 키로 레이아웃 리셋
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && layoutState !== 'default') {
            resetLayout();
        }
    });

    // 초기화
    document.addEventListener('DOMContentLoaded', function() {
        addMobileBackButton();
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

    if(document.getElementById("prev")) {
        document.getElementById("prev").addEventListener("click", () => renderCalendar(currentYear, currentMonth - 1));
    }

    if(document.getElementById("next")) {
        document.getElementById("next").addEventListener("click", () => renderCalendar(currentYear, currentMonth + 1));
    }

    function renderCalendar(year, month) {
        if(!calendarEl) {
            return;
        }

        calendarEl.innerHTML = ""; // 기존 내용 지우기
        calendarYm.innerHTML = "";
        currentYear = year;
        currentMonth = month;
        let isActiveEvent = false;

        const firstDay = new Date(year, month, 1).getDay(); // 월의 첫째 날 요일
        const daysInMonth = new Date(year, month + 1, 0).getDate(); // 월의 총 일수

        // 실제 필요한 줄 수 계산
        const totalCells = firstDay + daysInMonth; // 빈칸 + 실제 날짜
        const actualRows = Math.ceil(totalCells / 7); // 실제 필요한 줄 수

        let calendarYmHTML = `<span>${year}년 ${month + 1}월</span>`
        let calendarHTML = `<div class="calendar-grid">`;

        // 요일 헤더 추가
        const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
        weekDays.forEach(day => calendarHTML += `<div class="day-header">${day}</div>`);

        // 일별 화면 높이 계산
        let dayHeight;
        let calculatedHeight;

        if (actualRows === 5) {
            calculatedHeight = (window.innerHeight - 44 - 60 - 21 -90) / 5;
            dayHeight = `${calculatedHeight}px`;
        } else if (actualRows === 6) {
            calculatedHeight = (window.innerHeight - 44 - 60 - 21 -90) / 6;
            dayHeight = `${calculatedHeight}px`;
        }

        // 첫 주 빈 칸 추가
        for (let i = 0; i < firstDay; i++) {
            calendarHTML += `<div class="empty" style="height:${dayHeight}"></div>`;
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
                    `<button class="holidayItem"><span class="holidayItemSpan">${name}</span></button>`
                ).join('');
            }
            
            calendarHTML += `<div class="${dayClass}" style="height:${dayHeight}"
                                data-year="${year}" 
                                data-month="${month}" 
                                data-day="${day}"
                                data-date="${fullDateStr}"
                                data-day-of-week="${dayOfWeek}">
                                <div class="day-number-container">
                                    <div class="day-number">${day}</div>
                                </div>
                                <div class="day-events-container"></div>
                                <div class="day-holiday-container">${holidayHTML}</div>
                            </div>`;
        }

        calendarHTML += `</div>`;
        calendarEl.innerHTML = calendarHTML;
        calendarYm.innerHTML = calendarYmHTML;

        // 달력의 이벤트 및 요소들 초기 세팅
        initWindow();

        // 기존 이벤트들 다시 그리기 (서버에서 가져온 이벤트들)
        loadAndRenderExistingEvents(year, month);

        // 현재 작성 중인 이벤트가 있으면 그리기
        if(isActiveEvent) {
            let title = $('#event-title').val()?.trim() || 'New Event';
            
            drawEvent(title, initialStaDt, initialEndDt);
        }

        // 연속 이벤트 간격 제거 (렌더링 완료 후)
        setTimeout(() => {
            removeEventGaps();
            //adjustCalendarLayout();
        }, 50);
    }

    // 기존 이벤트들을 로드하고 렌더링하는 함수
    function loadAndRenderExistingEvents(year, month) {
        // 여기서 서버나 로컬 스토리지에서 기존 이벤트들을 가져와서 렌더링
        // 예시:
        /*
        const existingEvents = getEventsForMonth(year, month);
        existingEvents.forEach(event => {
            drawEvent(event.title, new Date(event.startDate), new Date(event.endDate));
        });
        */
    }

    // 연속 이벤트 간격 제거 함수
    function removeEventGaps() {
        const rangeEvents = document.querySelectorAll('.range-event, .continuous-event');
        
        rangeEvents.forEach(event => {
            const parentDay = event.closest('.day');
            if (!parentDay) return;
            
            const isWeekStart = parentDay.classList.contains('week-start');
            const isWeekEnd = parentDay.classList.contains('week-end');
            
            if (event.classList.contains('range-start') || event.classList.contains('continuous-start')) {
                if (!isWeekEnd) {
                    event.style.marginRight = '-1px';
                    event.style.paddingRight = '1px';
                }
            }
            
            if (event.classList.contains('range-end') || event.classList.contains('continuous-end')) {
                if (!isWeekStart) {
                    event.style.marginLeft = '-1px';
                    event.style.paddingLeft = '1px';
                }
            }
            
            if (event.classList.contains('range-middle') || event.classList.contains('continuous-middle')) {
                event.style.marginLeft = '-1px';
                event.style.marginRight = '-1px';
                event.style.paddingLeft = '1px';
                event.style.paddingRight = '1px';
            }
        });
    }

    // 캘린더 레이아웃 조정
    function adjustCalendarLayout() {
        // 캘린더 그리드 간격 최소화
        const calendarGrid = document.querySelector('.calendar-grid');
        if (calendarGrid) {
            calendarGrid.style.gap = '1px';
        }
        
        // 각 날짜 셀의 패딩 조정
        const dayCells = document.querySelectorAll('.day');
        dayCells.forEach(cell => {
            cell.style.padding = '8px 1px';
        });
    }

    function initWindow() {
        // 시간 요소를 숨긴다.
        $('.time-input').css('visibility', 'hidden');
    }

    /**
     * 메인사이즈 조정 및 사이드섹션을 닫는다.
     */
    function offEventForm() {
        if (layoutState === 'bothExpanded') {
            expandLeftSection();
        } else if(layoutState === 'rightExpanded') {
            resetLayout();
        }
    }

    /**
     * 일정 생성 섹션을 호출한다
     */
    $('#toggleEvent').on('click', function() {
        expandRightSection();
        //onEventForm()
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
    
    function updateFlatpickr(startDate, endDate) {
        /*
        const formatted = formatDate(date);
        $('#start-date').val(formatted);
        $('#end-date').val(formatted);
        $('#start-date')[0]._flatpickr.setDate(date, true);
        $('#end-date')[0]._flatpickr.setDate(date, true);
        */
       
        // 종료일이 없으면 시작일을 사용
        const finalEndDate = endDate || startDate;
        
        const formattedStartDate = formatDate(startDate);
        const formattedEndDate = formatDate(finalEndDate);
        
        // 시작일 설정
        $('#start-date').val(formattedStartDate);
        $('#start-date')[0]._flatpickr.setDate(startDate, true);
        
        // 종료일 설정
        $('#end-date').val(formattedEndDate);
        $('#end-date')[0]._flatpickr.setDate(finalEndDate, true);
    }

    function handleDayClick() {
        const clickedDate = getClickedDate(this);
        selectedDate = clickedDate;
        
        // 현재 수정중인 날짜가 있으면
        if(initialStaDt && initialEndDt) {
            // 두 날짜의 차이를 구해서 현재 클릭한 날짜부터 차이만큼 다시 그려준다
            const startDate = new Date(initialStaDt);
            const endDate = new Date(initialEndDt);
            const dayDifference = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            
            // 새로운 시작일 설정
            const newStartDate = new Date(clickedDate);
            
            // 새로운 종료일 계산 (시작일 + 기존 기간)
            const newEndDate = new Date(newStartDate);
            newEndDate.setDate(newStartDate.getDate() + dayDifference);
            
            // 날짜 업데이트
            initialStaDt = newStartDate.toISOString().split('T')[0]; // YYYY-MM-DD 형식
            initialEndDt = newEndDate.toISOString().split('T')[0];
            
            let title = $('#event-title').val()?.trim() || 'New Event';

            updateFlatpickr(newStartDate, newEndDate);

            // 화면 다시 그리기 (이 부분은 실제 렌더링 함수명으로 바꿔주세요)
            drawEvent(title, newStartDate, newEndDate); // 또는 updateDateRange() 등
        }

        setFocusOnDay(this);
    }
    
    function handleDayDblclick() {
        //onEventForm();
        console.log('clicked handleDayClick');
        // layout
        if (layoutState === 'default') {
            expandRightSection();
        } else if(layoutState === 'leftExpanded') {
            expandBothSection();
        }

        const clickedDate = getClickedDate(this);
        selectedDate = clickedDate;
    
        updateFlatpickr(clickedDate);
    
        drawEvent("New Event", clickedDate);
    }


    /**
     * 캘린더에서 특정 날짜를 클릭했을때 이벤트를 발생시킨다
     */
    
    function handleDayClick1 () {
        //onEventForm();

        console.log('clicked handleDayClick1');
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
        //onEventForm();

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
        drawEvent("New Event", clickedDate, clickedDate);
    }

    /**
     * 캘린더 내부에서 날짜를 클릭시 해당 이벤트가 실행된다.
     */
    $('#calendar').on('click', '.day', handleDayClick);
    $('#calendar').on('dblclick', '.day', handleDayDblclick);

    function drawEvent(title, startDate, endDate = null) {
        // 기존에 이미 새 이벤트 아이템이 있으면 지워준다.
        const existingEventItems = document.querySelectorAll('.new-event-item');
        existingEventItems.forEach(item => item.remove());
        
        // 종료일이 없으면 시작일과 동일하게 설정 (단일 날짜)
        const finalEndDate = endDate || startDate;
        
        // 날짜 범위 생성
        const dateRange = getDateRange(startDate, finalEndDate);
        
        // 각 날짜에 이벤트 그리기 (간단한 방식)
        dateRange.forEach((date, index) => {
            drawEventForDate(title, date, index, dateRange.length);
        });
    }

    function drawEventForDate(title, date, index, totalDays) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();

        const container = document.querySelector(
            `[data-year="${year}"][data-month="${month}"][data-day="${day}"]`
        );

        if (!container) {
            console.warn(`Container not found for date: ${date.toDateString()}`);
            return;
        }

        const eventContainer = container.querySelector('.day-events-container');
        
        if (!eventContainer) {
            console.warn(`Event container not found for date: ${date.toDateString()}`);
            return;
        }

        // 휴일 및 기존 이벤트 확인
        const hasHoliday = container.querySelector('.day-holiday-container')?.innerHTML.trim() !== '';
        const existingEvents = eventContainer.querySelectorAll('.event-item, .new-event-item');

        const eventDiv = document.createElement('button');
        const eventSpan = document.createElement('span');
        
        eventSpan.classList.add('dayEventSpan');

        // 임시로 newEventSpan을 사용한다.
        // 해당 클래스는 이벤트 저장시 사라지고
        // 새롭게 dayEventSpan을 사용한다.

        //eventSpan.classList.add('newEventSpan');

        eventDiv.classList.add('new-event-item');

        // 선택중인 색상
        const color = $('#cmbEventColor').val() || '#3b82f6';
        eventDiv.style.backgroundColor = color;

        // 마진 설정 (휴일이나 기존 이벤트가 있으면)
        if (hasHoliday || existingEvents.length > 0) {
            eventDiv.style.marginTop = '2px';
        }

        // 범위 이벤트 스타일링
        if (totalDays > 1) {
            eventDiv.classList.add('range-event');
            
            if (index === 0) {
                // 시작일
                eventDiv.classList.add('range-start');
                eventDiv.style.borderTopRightRadius = '0';
                eventDiv.style.borderBottomRightRadius = '0';
                eventDiv.style.marginRight = '0';
                eventDiv.style.borderRight = 'none';
            } else if (index === totalDays - 1) {
                // 종료일
                eventDiv.classList.add('range-end');
                eventDiv.style.borderTopLeftRadius = '0';
                eventDiv.style.borderBottomLeftRadius = '0';
                eventDiv.style.marginLeft = '0';
                eventDiv.style.borderLeft = 'none';
            } else {
                // 중간일
                eventDiv.classList.add('range-middle');
                eventDiv.style.borderRadius = '0';
                eventDiv.style.marginLeft = '0';
                eventDiv.style.marginRight = '0';
                eventDiv.style.borderLeft = 'none';
                eventDiv.style.borderRight = 'none';
            }
        }

        // 이벤트 텍스트 설정
        let label = title;
        if (index > 0 && index < totalDays - 1) {
            label = '';
        }
        
        $('button.range-start > span').addClass('newEventSpan');
        
        eventSpan.innerHTML = label;

        // 구조 조립
        eventDiv.appendChild(eventSpan);
        eventContainer.appendChild(eventDiv);
    }

    // 날짜 범위 생성 함수
    function getDateRange(startDate, endDate) {
        const dates = [];
        const currentDate = new Date(startDate);
        const finalDate = new Date(endDate);
        
        while (currentDate <= finalDate) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
            
            // 무한 루프 방지
            if (dates.length > 365) {
                console.warn('Date range too large, limiting to 365 days');
                break;
            }
        }
        
        return dates;
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

                // 달력에 해당 범위를 그려준다
                initialStaDt = $('#start-date').val();
                initialEndDt = $('#end-date').val();
                drawEvent("New Event", $('#start-date').val(), $('#end-date').val());
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
            } else { // 시작일 보다 뒤라면
                // 달력에 해당 범위를 그려준다
                $('#end-date').removeClass('invalid-data');
                initialStaDt = $('#start-date').val();
                initialEndDt = $('#end-date').val();
                drawEvent("New Event", $('#start-date').val(), $('#end-date').val());
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
     * 태그 색상 변경 이벤트
     */
    $('#cmbEventColor').on('change', function () {
        const selectedColor = $(this).val();

        $('.option-section .optIcon').css('stroke', selectedColor);
        $('.new-event-item').css('background', selectedColor);
        $('.event-option select').css('border-bottom-color', selectedColor);
        $('.form-contents input:checked').css('background-color', selectedColor);
        $('.form-contents input:checked').css('border-color', selectedColor);
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

                    // newEventSpan 클래스는 지워준다.
                    
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

    renderCalendar(today.getFullYear(), today.getMonth());
});
