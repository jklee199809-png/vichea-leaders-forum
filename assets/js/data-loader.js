/*
 * 비채리더스포럼 데이터 로더
 * data/ 폴더의 JSON 파일을 읽어 페이지에 렌더링합니다.
 *
 * 사용법:
 *   메인 페이지: loadPrograms('main'), loadReviews('main')
 *   서브 페이지: loadPrograms('sub'), loadReviews('sub'), loadFaqs(), loadNotices()
 */

// 경로 자동 판별 (메인 vs pages 하위)
var DATA_BASE = (location.pathname.indexOf('/pages/') !== -1) ? '../data/' : 'data/';
var PAGES_BASE = (location.pathname.indexOf('/pages/') !== -1) ? '' : 'pages/';

function fetchJSON(filename) {
    return fetch(DATA_BASE + filename + '?v=' + Date.now()).then(function(r) {
        if (!r.ok) throw new Error(filename + ' load failed: ' + r.status);
        return r.json();
    }).catch(function(e) {
        console.error('[data-loader]', e);
        return [];
    });
}

// ========================================
// 프로그램 렌더링
// ========================================
function loadPrograms(mode) {
    fetchJSON('programs.json').then(function(data) {
        if (mode === 'main') {
            renderProgramsMain(data);
        } else if (mode === 'sub') {
            renderProgramsSub(data);
        } else if (mode === 'grid') {
            renderProgramsGrid(data);
        }
    });
}

function renderProgramsMain(data) {
    var container = document.querySelector('.program-list');
    if (!container) return;
    var html = '';
    data.forEach(function(p) {
        var badgeClass = p.statusType ? ' ' + p.statusType : '';
        var btnClass = p.btnOutline ? ' outline' : '';
        var link = PAGES_BASE + p.btnLink.replace('pages/', '');
        html += '<div class="program-item">';
        html += '<div class="program-date">';
        html += '<span class="month">' + p.month + '</span>';
        html += '<span class="day">' + p.day + '</span>';
        html += '<span class="year">' + p.year + '</span>';
        html += '</div>';
        html += '<div class="program-info">';
        html += '<span class="program-badge' + badgeClass + '">' + p.status + '</span>';
        html += '<h3>' + p.title + '</h3>';
        html += '<p class="program-meta">';
        html += '<span' + (p.meta1Temp ? ' class="temp-data"' : '') + '>' + p.meta1 + '</span>';
        html += '<span' + (p.meta2Temp ? ' class="temp-data"' : '') + '>' + p.meta2 + '</span>';
        html += '</p>';
        html += '</div>';
        html += '<a href="' + link + '" class="program-btn' + btnClass + '">' + p.btnText + '</a>';
        html += '</div>';
    });
    container.innerHTML = html;
}

function renderProgramsSub(data) {
    var container = document.querySelector('.program-list');
    if (!container) return;
    var html = '';
    data.forEach(function(p) {
        var badgeClass = p.statusType ? ' ' + p.statusType : '';
        var btnClass = p.btnOutline ? ' outline' : '';
        var link = p.btnLink.replace('pages/', '');
        html += '<div class="program-item">';
        html += '<div class="program-date">';
        html += '<span class="month">' + p.month + '</span>';
        html += '<span class="day">' + p.day + '</span>';
        html += '<span class="year">' + p.year + '</span>';
        html += '</div>';
        html += '<div class="program-info">';
        html += '<span class="program-badge' + badgeClass + '">' + p.status + '</span>';
        html += '<h3>' + p.title + '</h3>';
        html += '<p class="program-meta">';
        html += '<span' + (p.meta1Temp ? ' class="temp-data"' : '') + '>' + p.meta1 + '</span>';
        html += '<span' + (p.meta2Temp ? ' class="temp-data"' : '') + '>' + p.meta2 + '</span>';
        html += '</p>';
        html += '</div>';
        html += '<a href="' + link + '" class="program-btn' + btnClass + '">' + p.btnText + '</a>';
        html += '</div>';
    });
    container.innerHTML = html;
}

function renderProgramsGrid(data) {
    var container = document.querySelector('.program-grid');
    if (!container) return;
    var statusMap = { '': 'open', 'upcoming': 'preparing', 'closed': 'closed' };
    var html = '';
    data.forEach(function(p) {
        var badgeClass = statusMap[p.statusType] || 'preparing';
        var link = p.detailLink ? p.detailLink.replace('pages/', '') : '#';
        html += '<div class="program-box">';
        html += '<span class="program-box-badge ' + badgeClass + '">' + p.status + '</span>';
        html += '<h3>' + p.title + '</h3>';
        html += '<p>' + (p.desc || '') + '</p>';
        html += '<a href="' + link + '" class="program-box-btn">상세보기</a>';
        html += '</div>';
    });
    container.innerHTML = html;
}

// ========================================
// 리뷰 렌더링
// ========================================
function loadReviews(mode) {
    fetchJSON('reviews.json').then(function(data) {
        if (mode === 'main') {
            renderReviewsMain(data);
        } else if (mode === 'sub') {
            renderReviewsSub(data);
        }
    });
}

function renderReviewsMain(data) {
    var container = document.querySelector('.review-cards');
    if (!container) return;
    var items = data.slice(0, 3);
    var html = '';
    items.forEach(function(r) {
        html += '<div class="review-card">';
        if (r.thumbImage) {
            html += '<div class="review-thumb"><img src="' + PAGES_BASE + r.thumbImage + '" alt="' + r.title + '" style="width:100%;height:100%;object-fit:cover;"></div>';
        } else {
            html += '<div class="review-thumb">' + r.thumb + '</div>';
        }
        html += '<h4>' + r.title + '</h4>';
        html += '<p>' + r.desc + '</p>';
        html += '</div>';
    });
    container.innerHTML = html;
}

function renderReviewsSub(data) {
    var container = document.getElementById('reviewList');
    if (!container) return;
    var html = '';
    data.forEach(function(r) {
        html += '<div class="review-item" data-aos="fade-up">';
        if (r.thumbImage) {
            html += '<div class="review-thumb"><img src="' + r.thumbImage + '" alt="' + r.title + '" style="width:100%;height:100%;object-fit:cover;"></div>';
        } else {
            html += '<div class="review-thumb">' + r.thumb + '</div>';
        }
        html += '<div class="review-body">';
        html += '<span class="review-date">' + (r.date || '날짜 영역') + '</span>';
        html += '<h4>' + r.title + '</h4>';
        html += '<p>' + r.desc + '</p>';
        html += '</div>';
        html += '</div>';
    });
    container.innerHTML = html;
}

// ========================================
// FAQ 렌더링
// ========================================
function loadFaqs() {
    fetchJSON('faqs.json').then(function(data) {
        var container = document.querySelector('.faq-list');
        if (!container) return;
        var html = '';
        data.forEach(function(f) {
            html += '<div class="faq-item">';
            html += '<div class="faq-q"><span>' + f.question + '</span><span class="icon">+</span></div>';
            html += '<div class="faq-a"><div class="faq-a-inner">' + f.answer + '</div></div>';
            html += '</div>';
        });
        container.innerHTML = html;
        // FAQ 토글 이벤트 바인딩
        container.querySelectorAll('.faq-q').forEach(function(q) {
            q.addEventListener('click', function() {
                q.parentElement.classList.toggle('open');
            });
        });
    });
}

// ========================================
// 공지사항 렌더링
// ========================================
function loadNotices() {
    fetchJSON('notices.json').then(function(data) {
        var tbody = document.querySelector('.notice-table tbody');
        var detailContainer = document.getElementById('noticeDetailContainer');
        if (!tbody) return;

        var tbodyHtml = '';
        var detailHtml = '';
        data.forEach(function(n, i) {
            tbodyHtml += '<tr class="notice-row" data-id="' + n.id + '" style="cursor: pointer;">';
            tbodyHtml += '<td style="text-align: center;">' + n.id + '</td>';
            tbodyHtml += '<td><span class="notice-title-link">' + n.title + '</span></td>';
            tbodyHtml += '<td style="text-align: center;">' + n.date + '</td>';
            tbodyHtml += '</tr>';

            detailHtml += '<div class="notice-detail" id="noticeDetail-' + n.id + '">';
            detailHtml += '<h3>' + n.title + '</h3>';
            detailHtml += '<p class="notice-meta">작성일: ' + n.date + '</p>';
            detailHtml += '<div class="notice-detail-body">' + n.body + '</div>';
            detailHtml += '</div>';
        });
        tbody.innerHTML = tbodyHtml;
        if (detailContainer) detailContainer.innerHTML = detailHtml;

        // 클릭 토글 이벤트
        tbody.querySelectorAll('.notice-row').forEach(function(row) {
            row.addEventListener('click', function() {
                var id = row.getAttribute('data-id');
                var detail = document.getElementById('noticeDetail-' + id);
                if (detail) {
                    // 다른 디테일 닫기
                    document.querySelectorAll('.notice-detail.show').forEach(function(d) {
                        if (d !== detail) d.classList.remove('show');
                    });
                    detail.classList.toggle('show');
                }
            });
        });
    });
}
