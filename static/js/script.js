document.addEventListener('DOMContentLoaded', function() {  // اضافه کردن رویداد به محض بارگذاری کامل DOM
    const addBtn = document.getElementById('addBtn');  // دریافت دکمه اضافه کردن با شناسه 'addBtn'
    const todoInput = document.getElementById('todoInput');  // دریافت فیلد ورودی با شناسه 'todoInput'
    const todoList = document.getElementById('todoList');  // دریافت لیست کارها با شناسه 'todoList'
    const deletedList = document.getElementById('deletedList');  // دریافت لیست کارهای حذف شده با شناسه 'deletedList'
  
    // دریافت و نمایش کارها هنگام بارگذاری صفحه
    function fetchTodos() {  // تابع برای دریافت لیست کارها از سرور
      fetch('/todos')  // ارسال درخواست GET به مسیر '/todos'
        .then(response => response.json())  // تبدیل پاسخ به فرمت JSON
        .then(data => {  // پردازش داده‌های دریافتی
          renderTodos(data);  // فراخوانی تابع نمایش کارها با داده‌های دریافتی
        });
    }
  
    // نمایش کارهای فعال و حذف شده
    function renderTodos(data) {  // تابع برای نمایش کارها با داده‌های دریافتی
      // نمایش کارهای فعال
      todoList.innerHTML = '';  // پاک کردن محتوای لیست کارهای فعال
      data.active.forEach(todo => {  // پیمایش آرایه کارهای فعال
        const li = document.createElement('li');  // ایجاد یک عنصر لیست جدید
  
        // چک‌باکس برای وضعیت تکمیل
        const checkbox = document.createElement('input');  // ایجاد یک المان ورودی
        checkbox.type = 'checkbox';  // تنظیم نوع ورودی به چک‌باکس
        checkbox.checked = todo.completed;  // تنظیم وضعیت چک‌باکس بر اساس وضعیت تکمیل کار
        checkbox.addEventListener('change', function() {  // اضافه کردن رویداد تغییر وضعیت
          updateTodo(todo.id, checkbox.checked);  // فراخوانی تابع به‌روزرسانی کار با شناسه و وضعیت جدید
        });
  
        // عنصر متنی برای نمایش محتوای کار
        const span = document.createElement('span');  // ایجاد یک عنصر متنی
        span.textContent = todo.content;  // تنظیم محتوای متنی به محتوای کار
        if (todo.completed) {  // بررسی وضعیت تکمیل کار
          span.classList.add('completed');  // اضافه کردن کلاس 'completed' برای نمایش متفاوت
        }
  
        // دکمه حذف برای انتقال کار به لیست حذف شده‌ها
        const deleteBtn = document.createElement('button');  // ایجاد یک دکمه
        deleteBtn.textContent = 'Delete';  // تنظیم متن دکمه به 'Delete'
        deleteBtn.classList.add('delete-btn');  // اضافه کردن کلاس 'delete-btn' برای استایل‌دهی
        deleteBtn.addEventListener('click', function() {  // اضافه کردن رویداد کلیک
          deleteTodo(todo.id);  // فراخوانی تابع حذف کار با شناسه کار
        });
  
        li.appendChild(checkbox);  // افزودن چک‌باکس به عنصر لیست
        li.appendChild(span);  // افزودن متن به عنصر لیست
        li.appendChild(deleteBtn);  // افزودن دکمه حذف به عنصر لیست
        todoList.appendChild(li);  // افزودن عنصر لیست به لیست کارهای فعال
      });
  
      // نمایش کارهای حذف شده در نوار کناری
      deletedList.innerHTML = '';  // پاک کردن محتوای لیست کارهای حذف شده
      data.deleted.forEach(todo => {  // پیمایش آرایه کارهای حذف شده
        const li = document.createElement('li');  // ایجاد یک عنصر لیست جدید
  
        // عنصر متنی برای نمایش محتوای کار حذف شده
        const span = document.createElement('span');  // ایجاد یک عنصر متنی
        span.textContent = todo.content;  // تنظیم محتوای متنی به محتوای کار
        // اختیاری: اضافه کردن یک کلاس برای استایل‌دهی بیشتر:
        span.classList.add('deleted-text');  // اضافه کردن کلاس 'deleted-text' برای استایل‌دهی
  
        // دکمه بازگرداندن
        const restoreBtn = document.createElement('button');  // ایجاد یک دکمه
        restoreBtn.textContent = 'Restore';  // تنظیم متن دکمه به 'Restore'
        restoreBtn.classList.add('restore-btn');  // اضافه کردن کلاس 'restore-btn' برای استایل‌دهی
        restoreBtn.addEventListener('click', function() {  // اضافه کردن رویداد کلیک
          restoreTodo(todo.id);  // فراخوانی تابع بازگرداندن کار با شناسه کار
        });
  
        li.appendChild(span);  // افزودن متن به عنصر لیست
        li.appendChild(restoreBtn);  // افزودن دکمه بازگرداندن به عنصر لیست
        deletedList.appendChild(li);  // افزودن عنصر لیست به لیست کارهای حذف شده
      });
    }
  
    // افزودن کار جدید از طریق درخواست POST
    addBtn.addEventListener('click', function() {  // اضافه کردن رویداد کلیک به دکمه اضافه کردن
      const todo = todoInput.value.trim();  // دریافت متن کار جدید و حذف فاصله‌های اضافی
      if (!todo) return;  // اگر متن خالی است، از ادامه اجرا جلوگیری کن
      fetch('/add', {  // ارسال درخواست POST به مسیر '/add'
        method: 'POST',  // تنظیم متد درخواست به POST
        headers: {  // تنظیم هدرهای درخواست
          'Content-Type': 'application/json'  // تنظیم نوع محتوا به JSON
        },
        body: JSON.stringify({ todo })  // تبدیل داده به رشته JSON و ارسال در بدنه درخواست
      })
        .then(response => response.json())  // تبدیل پاسخ به فرمت JSON
        .then(data => {  // پردازش داده‌های دریافتی
          if (data.status === 'success') {  // بررسی موفقیت‌آمیز بودن عملیات
            renderTodos(data);  // نمایش لیست به‌روزشده کارها
            todoInput.value = '';  // پاک کردن فیلد ورودی
          } else {  // در صورت بروز خطا
            alert(data.message);  // نمایش پیام خطا
          }
        });
    });
  
    // علامت‌گذاری یک کار به عنوان حذف شده از طریق درخواست POST
    function deleteTodo(id) {  // تابع برای حذف کار با شناسه مشخص
      fetch('/delete', {  // ارسال درخواست POST به مسیر '/delete'
        method: 'POST',  // تنظیم متد درخواست به POST
        headers: {  // تنظیم هدرهای درخواست
          'Content-Type': 'application/json'  // تنظیم نوع محتوا به JSON
        },
        body: JSON.stringify({ id })  // تبدیل شناسه به رشته JSON و ارسال در بدنه درخواست
      })
        .then(response => response.json())  // تبدیل پاسخ به فرمت JSON
        .then(data => {  // پردازش داده‌های دریافتی
          if (data.status === 'success') {  // بررسی موفقیت‌آمیز بودن عملیات
            renderTodos(data);  // نمایش لیست به‌روزشده کارها
          } else {  // در صورت بروز خطا
            alert(data.message);  // نمایش پیام خطا
          }
        });
    }
  
    // به‌روزرسانی وضعیت تکمیل از طریق درخواست POST
    function updateTodo(id, completed) {  // تابع برای به‌روزرسانی وضعیت تکمیل کار
      fetch('/update', {  // ارسال درخواست POST به مسیر '/update'
        method: 'POST',  // تنظیم متد درخواست به POST
        headers: {  // تنظیم هدرهای درخواست
          'Content-Type': 'application/json'  // تنظیم نوع محتوا به JSON
        },
        body: JSON.stringify({ id, completed })  // تبدیل داده به رشته JSON و ارسال در بدنه درخواست
      })
        .then(response => response.json())  // تبدیل پاسخ به فرمت JSON
        .then(data => {  // پردازش داده‌های دریافتی
          if (data.status === 'success') {  // بررسی موفقیت‌آمیز بودن عملیات
            renderTodos(data);  // نمایش لیست به‌روزشده کارها
          } else {  // در صورت بروز خطا
            alert(data.message);  // نمایش پیام خطا
          }
        });
    }
  
    // بازگرداندن یک کار حذف شده از طریق درخواست POST
    function restoreTodo(id) {  // تابع برای بازگرداندن کار حذف شده
      fetch('/restore', {  // ارسال درخواست POST به مسیر '/restore'
        method: 'POST',  // تنظیم متد درخواست به POST
        headers: {  // تنظیم هدرهای درخواست
          'Content-Type': 'application/json'  // تنظیم نوع محتوا به JSON
        },
        body: JSON.stringify({ id })  // تبدیل شناسه به رشته JSON و ارسال در بدنه درخواست
      })
        .then(response => response.json())  // تبدیل پاسخ به فرمت JSON
        .then(data => {  // پردازش داده‌های دریافتی
          if (data.status === 'success') {  // بررسی موفقیت‌آمیز بودن عملیات
            renderTodos(data);  // نمایش لیست به‌روزشده کارها
          } else {  // در صورت بروز خطا
            alert(data.message);  // نمایش پیام خطا
          }
        });
    }
  
    fetchTodos();  // فراخوانی تابع دریافت کارها هنگام بارگذاری صفحه
  });
  