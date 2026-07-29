import os
import re
import sqlite3
import telebot
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton, ReplyKeyboardMarkup, KeyboardButton
from dotenv import load_dotenv

load_dotenv()

TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
PHOTOS_DIR = "photos"
DB_FILE = "bot_database.db"

if not TOKEN:
    print("Error: TELEGRAM_BOT_TOKEN not found in .env file.")
    exit(1)

from telebot import apihelper

if os.getenv("TELEGRAM_API_URL"):
    # Change the base URL for Telegram API
    apihelper.API_URL = os.getenv("TELEGRAM_API_URL") + "/bot{0}/{1}"

bot = telebot.TeleBot(TOKEN)

if not os.path.exists(PHOTOS_DIR):
    os.makedirs(PHOTOS_DIR)

def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS users
                 (user_id INTEGER PRIMARY KEY,
                  language TEXT,
                  name TEXT,
                  profession TEXT,
                  contribution TEXT,
                  phone_number TEXT,
                  has_received_photo INTEGER DEFAULT 0)''')
    conn.commit()
    conn.close()

init_db()

def update_user_db(user_id, field, value):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute(f"INSERT INTO users (user_id, {field}) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET {field}=?", 
              (user_id, value, value))
    conn.commit()
    conn.close()

def get_user_lang(user_id):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT language FROM users WHERE user_id = ?", (user_id,))
    row = c.fetchone()
    conn.close()
    return row[0] if row and row[0] else 'fa'

STRINGS = {
    'fa': {
        'ask_name': "با سلام و احترام.\nلطفاً خودتان را معرفی نمایید (نام و نام خانوادگی):",
        'ask_profession': "سپاسگزارم. لطفاً شغل یا تخصص اصلی خود را مرقوم فرمایید:",
        'ask_contribution': "بسیار عالی. لطفاً بفرمایید چه کمک‌ها یا خدماتی می‌توانید به جبهه اسلام ارائه دهید؟",
        'ask_phone': "از توضیحات شما سپاسگزاریم.\nاکنون لطفاً جهت دریافت تصویر، شماره تلفن همراه خود را وارد نمایید:",
        'ask_phone_skipped': "لطفاً جهت دریافت تصویر، شماره تلفن همراه خود را وارد نمایید:",
        'invalid_phone': "شماره تلفن وارد شده معتبر نمی‌باشد. لطفاً مجدداً تلاش فرمایید (مثال: +989123456789):",
        'photo_caption': "تصویر مربوط به شماره {phone}",
        'not_found': "متأسفانه تصویری برای این شماره یافت نشد، و یا شماره وارد شده اشتباه است.",
        'fallback': "جهت شروع مجدد لطفاً دستور /start را ارسال نمایید.",
        'support_msg': "جهت ارتباط با پشتیبانی، لطفاً پیام خود را ارسال فرمایید.",
        'skip_btn': "علاقه‌ای به پاسخ دادن ندارم. دریافت عکس",
        'support_btn': "پشتیبانی",
        'restart_btn': "شروع مجدد"
    },
    'en': {
        'ask_name': "Greetings.\nPlease introduce yourself (Full Name):",
        'ask_profession': "Thank you. Please specify your main profession or expertise:",
        'ask_contribution': "Excellent. Please let us know how you can contribute or provide services to the Islamic Front:",
        'ask_phone': "We appreciate your responses.\nNow, please enter your mobile phone number to receive your photo:",
        'ask_phone_skipped': "Please enter your mobile phone number to receive your photo:",
        'invalid_phone': "The phone number entered is invalid. Please try again (e.g., +989123456789):",
        'photo_caption': "Photo for number {phone}",
        'not_found': "Unfortunately, no photo was found for this number, or the number is incorrect.",
        'fallback': "To restart, please send the /start command.",
        'support_msg': "For support inquiries, please send your message.",
        'skip_btn': "I prefer not to answer. Get photo",
        'support_btn': "Support",
        'restart_btn': "Restart"
    },
    'ar': {
        'ask_name': "تحية طيبة.\nيرجى تقديم نفسك (الاسم الكامل):",
        'ask_profession': "شكراً لك. يرجى تحديد مهنتك أو تخصصك الأساسي:",
        'ask_contribution': "ممتاز. يرجى إعلامنا كيف يمكنك المساهمة أو تقديم الخدمات للجبهة الإسلامية:",
        'ask_phone': "نقدر إجاباتك.\nالآن، يرجى إدخال رقم هاتفك المحمول لاستلام صورتك:",
        'ask_phone_skipped': "يرجى إدخال رقم هاتفك المحمول لاستلام صورتك:",
        'invalid_phone': "رقم الهاتف المدخل غير صالح. يرجى المح المحاولة مرة أخرى (مثال: +989123456789):",
        'photo_caption': "الصورة الخاصة بالرقم {phone}",
        'not_found': "عذراً، لم يتم العثور على صورة لهذا الرقم، أو أن الرقم غير صحيح.",
        'fallback': "لإعادة البدء، يرجى إرسال أمر /start.",
        'support_msg': "للتواصل مع الدعم الفني، يرجى إرسال رسالتك.",
        'skip_btn': "لا أرغب في الإجابة. احصل على الصورة",
        'support_btn': "الدعم الفني",
        'restart_btn': "إعادة البدء"
    }
}

user_last_bot_msg = {}

def get_string(user_id, key, **kwargs):
    lang = get_user_lang(user_id)
    text = STRINGS[lang][key]
    return text.format(**kwargs)

def get_main_menu(user_id):
    markup = ReplyKeyboardMarkup(resize_keyboard=True, row_width=2)
    markup.add(
        KeyboardButton(get_string(user_id, 'restart_btn')),
        KeyboardButton(get_string(user_id, 'support_btn'))
    )
    return markup

def get_skip_markup(user_id):
    markup = InlineKeyboardMarkup()
    markup.add(InlineKeyboardButton(get_string(user_id, 'skip_btn'), callback_data="skip_form"))
    return markup

def delete_previous_bot_message(chat_id):
    if chat_id in user_last_bot_msg:
        try:
            bot.delete_message(chat_id, user_last_bot_msg[chat_id])
        except Exception:
            pass

def send_and_track(chat_id, text, reply_markup=None):
    delete_previous_bot_message(chat_id)
    msg = bot.send_message(chat_id, text, reply_markup=reply_markup)
    user_last_bot_msg[chat_id] = msg.message_id
    return msg

def extract_phone_number(text):
    if not text:
        return None
    pattern = r'^\+(\d+)$'
    match = re.search(pattern, text.replace(" ", "").replace("-", ""))
    if match:
        return "+" + match.group(1)
    return None

def trigger_start(message):
    bot.clear_step_handler_by_chat_id(chat_id=message.chat.id)
    markup = InlineKeyboardMarkup()
    markup.row_width = 3
    markup.add(
        InlineKeyboardButton("🇮🇷 فارسی", callback_data="lang_fa"),
        InlineKeyboardButton("🇬🇧 English", callback_data="lang_en"),
        InlineKeyboardButton("🇸🇦 العربية", callback_data="lang_ar")
    )
    send_and_track(message.chat.id, "لطفا زبان خود را انتخاب کنید:", reply_markup=markup)

@bot.message_handler(commands=['start'])
def send_welcome(message):
    trigger_start(message)

@bot.message_handler(func=lambda message: message.text in [STRINGS['fa']['restart_btn'], STRINGS['en']['restart_btn'], STRINGS['ar']['restart_btn']])
def restart_button_handler(message):
    trigger_start(message)

@bot.callback_query_handler(func=lambda call: call.data.startswith('lang_'))
def language_callback(call):
    lang_code = call.data.split('_')[1]
    user_id = call.from_user.id
    update_user_db(user_id, 'language', lang_code)
    
    bot.send_message(call.message.chat.id, "✅", reply_markup=get_main_menu(user_id))
    msg = send_and_track(call.message.chat.id, get_string(user_id, 'ask_name'), reply_markup=get_skip_markup(user_id))
    bot.register_next_step_handler(msg, process_name_step)

@bot.callback_query_handler(func=lambda call: call.data == 'skip_form')
def skip_form_callback(call):
    user_id = call.from_user.id
    bot.clear_step_handler_by_chat_id(chat_id=call.message.chat.id)
    
    msg = send_and_track(call.message.chat.id, get_string(user_id, 'ask_phone_skipped'))
    bot.register_next_step_handler(msg, process_phone_step)

def check_special_buttons(message):
    if message.text in [STRINGS['fa']['support_btn'], STRINGS['en']['support_btn'], STRINGS['ar']['support_btn']]:
        handle_support(message)
        return True
    if message.text in [STRINGS['fa']['restart_btn'], STRINGS['en']['restart_btn'], STRINGS['ar']['restart_btn']]:
        trigger_start(message)
        return True
    return False

def process_name_step(message):
    if check_special_buttons(message): return
        
    user_id = message.from_user.id
    update_user_db(user_id, 'name', message.text)
    
    msg = send_and_track(message.chat.id, get_string(user_id, 'ask_profession'), reply_markup=get_skip_markup(user_id))
    bot.register_next_step_handler(msg, process_profession_step)

def process_profession_step(message):
    if check_special_buttons(message): return

    user_id = message.from_user.id
    update_user_db(user_id, 'profession', message.text)
    
    msg = send_and_track(message.chat.id, get_string(user_id, 'ask_contribution'), reply_markup=get_skip_markup(user_id))
    bot.register_next_step_handler(msg, process_contribution_step)

def process_contribution_step(message):
    if check_special_buttons(message): return

    user_id = message.from_user.id
    update_user_db(user_id, 'contribution', message.text)
    
    msg = send_and_track(message.chat.id, get_string(user_id, 'ask_phone'))
    bot.register_next_step_handler(msg, process_phone_step)

def process_phone_step(message):
    if check_special_buttons(message): return

    phone_number = extract_phone_number(message.text)
    if phone_number:
        update_user_db(message.from_user.id, 'phone_number', phone_number)
        process_phone_number(message, phone_number)
    else:
        msg = send_and_track(message.chat.id, get_string(message.from_user.id, 'invalid_phone'))
        bot.register_next_step_handler(msg, process_phone_step)

def process_phone_number(message, phone_number):
    user_id = message.from_user.id
    photo_path = os.path.join(PHOTOS_DIR, f"{phone_number}.jpg")
    
    delete_previous_bot_message(message.chat.id)
    
    if os.path.exists(photo_path):
        try:
            with open(photo_path, 'rb') as photo:
                caption = get_string(user_id, 'photo_caption', phone=phone_number)
                bot.send_photo(message.chat.id, photo, caption=caption)
                update_user_db(user_id, 'has_received_photo', 1)
        except Exception as e:
            print(f"Error sending photo: {e}")
            send_and_track(message.chat.id, "Error sending photo.")
    else:
        send_and_track(message.chat.id, get_string(user_id, 'not_found'))

def handle_support(message):
    send_and_track(message.chat.id, get_string(message.from_user.id, 'support_msg'))
    bot.clear_step_handler_by_chat_id(chat_id=message.chat.id)

@bot.message_handler(func=lambda message: message.text in [STRINGS['fa']['support_btn'], STRINGS['en']['support_btn'], STRINGS['ar']['support_btn']])
def support_button_handler(message):
    handle_support(message)

@bot.message_handler(func=lambda message: True)
def handle_all_other_messages(message):
    if check_special_buttons(message): return
    phone_number = extract_phone_number(message.text)
    if phone_number:
        update_user_db(message.from_user.id, 'phone_number', phone_number)
        process_phone_number(message, phone_number)
    else:
        send_and_track(message.chat.id, get_string(message.from_user.id, 'fallback'))

if __name__ == '__main__':
    print("Telegram Bot is starting...")
    bot.infinity_polling()
