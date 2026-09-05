(function () {
    function sendSupportEmail(subject, message) {
        if (typeof chatState !== 'undefined' && chatState.isSending) return Promise.resolve(false);
        const userEmail = requireUserEmail();
        if (!userEmail) return Promise.resolve(false);

        chatState.isSending = true;
        chatState.isMessagePending = false;
        chatState.pendingMessage = '';
        showTypingIndicator();
        sendBtn.disabled = true;

        const senderName = (userEmail.split('@')[0] || 'مستخدم خدمة الدعم').trim();
        const fields = {
            access_key: chatState.accessKey,
            subject: 'رسالة دعم جديدة من موقع Zach',
            name: senderName,
            email: userEmail,
            replyto: userEmail,
            message: String(message || '').trim(),
            redirect: new URL('form-ok.html', window.location.href).href
        };

        return new Promise(function (resolve, reject) {
            const iframe = document.createElement('iframe');
            const frameName = 'w3f_frame_' + Date.now();
            iframe.name = frameName;
            iframe.title = 'web3forms';
            iframe.style.display = 'none';

            const form = document.createElement('form');
            form.method = 'POST';
            form.action = 'https://api.web3forms.com/submit';
            form.target = frameName;
            form.acceptCharset = 'UTF-8';
            form.style.display = 'none';

            Object.keys(fields).forEach(function (key) {
                const isLong = key === 'message';
                const input = document.createElement(isLong ? 'textarea' : 'input');
                if (!isLong) input.type = 'hidden';
                else input.style.display = 'none';
                input.name = key;
                input.value = fields[key];
                form.appendChild(input);
            });

            let settled = false;
            function finish(ok, err) {
                if (settled) return;
                settled = true;
                window.clearTimeout(timer);
                if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
                if (form.parentNode) form.parentNode.removeChild(form);
                if (ok) resolve(true);
                else reject(err || new Error('حدث خطأ أثناء إرسال الرسالة'));
            }

            iframe.onload = function () {
                try {
                    const href = iframe.contentWindow.location.href || '';
                    if (!href || href === 'about:blank') return;
                    if (href.indexOf('form-ok.html') !== -1) finish(true);
                    else finish(false);
                } catch (e) {
                    finish(false);
                }
            };

            const timer = window.setTimeout(function () {
                finish(false, new Error('انتهت مهلة الإرسال'));
            }, 15000);

            document.body.appendChild(iframe);
            document.body.appendChild(form);
            form.submit();
        })
            .then(function () {
                hideTypingIndicator();
                const lastUserMessage = document.querySelector('.message.user-message.sending');
                if (lastUserMessage) {
                    lastUserMessage.classList.remove('sending');
                    lastUserMessage.classList.add('sent');
                    setTimeout(function () {
                        lastUserMessage.classList.remove('sent');
                    }, 1000);
                }
                chatState.emailSent = true;
                addSystemMessage('تم إرسال رسالتك بنجاح');
                addBotMessage('شكراً لك! سنقوم بالرد عليك في أقرب وقت ممكن.');
                showToast('تم إرسال الرسالة بنجاح!', 'success');
                return true;
            })
            .catch(function (error) {
                hideTypingIndicator();
                const lastUserMessage = document.querySelector('.message.user-message.sending');
                if (lastUserMessage) {
                    lastUserMessage.classList.remove('sending');
                    lastUserMessage.classList.add('error');
                }
                addSystemMessage('فشل في إرسال الرسالة، يرجى المحاولة مرة أخرى');
                showToast('فشل في إرسال الرسالة!', 'error');
                console.error('خطأ في إرسال النموذج:', error);
                return false;
            })
            .then(function (result) {
                chatState.isSending = false;
                sendBtn.disabled = false;
                return result;
            });
    }

    window.sendSupportEmail = sendSupportEmail;

    ['subjectModal', 'subjectInput', 'submitSubjectBtn', 'cancelSubjectBtn'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el && el.parentNode) el.parentNode.removeChild(el);
    });
})();
