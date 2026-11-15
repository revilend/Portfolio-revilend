import os
import asyncio
from aiohttp import web
from aiogram import Bot, Dispatcher, F
from aiogram.filters import CommandStart
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup

BOT_TOKEN = os.getenv("BOT_TOKEN")
ADMIN_ID = int(os.getenv("ADMIN_ID", "0"))  # O'zingizning Telegram ID raqamingiz
PORT = int(os.getenv("PORT", 10000))

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

class OrderState(StatesGroup):
    waiting_text = State()

def main_menu():
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🌐 Revilend.uz (3D Portfolio)", web_app=WebAppInfo(url="https://revilend.uz"))],
        [
            InlineKeyboardButton(text="🎮 Revilend Games", url="https://t.me/revilend_gamesbot"),
            InlineKeyboardButton(text="🎵 @revilendmusic", url="https://youtube.com/@revilendmusic"),
        ],
        [InlineKeyboardButton(text="📩 Buyurtma / Loyiha yuborish", callback_data="order")],
    ])

@dp.message(CommandStart())
async def cmd_start(message: Message):
    await message.answer(
        f"Salom, {message.from_user.first_name}! 👋\n\n"
        "Bu — **Revilend** ekotizimining rasmiy markazi.\n"
        "Portfolio saytni Mini App sifatida ochishingiz, loyihalar bilan tanishishingiz "
        "yoki bot/sayt buyurtma qoldirishingiz mumkin:",
        reply_markup=main_menu(),
        parse_mode="Markdown"
    )

@dp.callback_query(F.data == "order")
async def ask_order(call: CallbackQuery, state: FSMContext):
    await state.set_state(OrderState.waiting_text)
    await call.message.answer("✍️ Qanday bot, sayt yoki loyiha kerakligini yozib yuboring (aloqa uchun @username ham qoldiring):")
    await call.answer()

@dp.message(OrderState.waiting_text)
async def send_order(message: Message, state: FSMContext):
    await state.clear()
    user = message.from_user
    text = (
        f"📥 **Yangi buyurtma (@revilendbot)**\n"
        f"👤 {user.full_name} (@{user.username or 'yoq'}) | ID: `{user.id}`\n\n"
        f"💬 {message.text}"
    )
    if ADMIN_ID:
        await bot.send_message(ADMIN_ID, text, parse_mode="Markdown")
    await message.answer("✅ Xabaringiz yuborildi! Tez orada javob beramiz.", reply_markup=main_menu())

# revilend.uz aloqa formasidan keladigan so'rovlar uchun API
async def handle_web_contact(request: web.Request):
    headers = {
        "Access-Control-Allow-Origin": "https://revilend.uz",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }
    if request.method == "OPTIONS":
        return web.Response(status=204, headers=headers)
    try:
        data = await request.json()
        name = data.get("name", "Noma'lum")
        contact = data.get("contact", "Ko'rsatilmagan")
        msg = data.get("message", "")
        if ADMIN_ID and msg:
            await bot.send_message(
                ADMIN_ID,
                f"🌐 **Revilend.uz saytidan yangi xabar!**\n\n"
                f"👤 **Ism:** {name}\n"
                f"📞 **Aloqa:** {contact}\n"
                f"💬 **Xabar:** {msg}",
                parse_mode="Markdown"
            )
        return web.json_response({"ok": True}, headers=headers)
    except Exception as e:
        return web.json_response({"ok": False, "error": str(e)}, status=400, headers=headers)

async def health(request):
    return web.Response(text="revilendbot is running")

async def main():
    app = web.Application()
    app.router.add_get("/", health)
    app.router.add_route("*", "/api/contact", handle_web_contact)
    runner = web.AppRunner(app)
    await runner.setup()
    await web.TCPSite(runner, "0.0.0.0", PORT).start()
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
  
