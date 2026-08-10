# CLB Thanh niên Tình nguyện — Bản cuối cùng

Đây là bản tổng hợp cuối cùng để chạy local hoặc đưa lên hosting.

## 1. File chính

- `index.html`: toàn bộ website.
- Website là dạng HTML/CSS/JavaScript thuần, không cần Node.js, npm hay framework.

## 2. Tài khoản Admin

- **Tên đăng nhập:** `admin`
- **Mật khẩu:** `CLB2026!`

Khu vực Admin nằm ở nút **Khu vực Admin** trên đầu website.

## 3. Chức năng hiện có

- Form đăng ký thành viên.
- Không yêu cầu email ứng viên.
- Ứng viên nhập: họ tên, SĐT, khoa, lớp, khóa.
- Chọn tối đa 2 ban.
- Sau khi gửi thành công sẽ chuyển sang màn hình **“Bạn đã đăng ký thành công!”**.
- Link nhóm Zalo chỉ xuất hiện sau khi đăng ký thành công.
- Có nút đăng ký lại/cập nhật thông tin.
- Nếu cùng một SĐT đăng ký lại:
  - hệ thống xem đó là cùng một người;
  - bản mới nhất thay thế bản cũ;
  - Admin chỉ thấy bản đăng ký cuối cùng.
- Admin có:
  - tổng số đăng ký;
  - thống kê theo ban;
  - tìm kiếm;
  - lọc theo ban;
  - phân nhóm theo **cùng ban + cùng khóa + cùng lớp**;
  - xuất CSV;
  - xóa toàn bộ dữ liệu.
- Khi Admin tải danh sách, hệ thống tiếp tục lọc trùng theo SĐT để tránh hiển thị hồ sơ cũ.

## 4. Chạy local để kiểm tra giao diện

Cách đơn giản nhất:

1. Đặt `index.html` trong một thư mục.
2. Mở bằng Chrome/Edge/Firefox.

Hoặc chạy local server bằng Python:

```bash
python -m http.server 8000
```

Sau đó mở:

```text
http://localhost:8000
```

Nếu máy dùng lệnh `python3`:

```bash
python3 -m http.server 8000
```

## 5. Chế độ local khi CHƯA cấu hình Supabase

Trong `index.html` hiện có:

```js
const SUPABASE_URL = "PASTE_SUPABASE_URL_HERE";
const SUPABASE_ANON_KEY = "PASTE_SUPABASE_ANON_KEY_HERE";
```

Nếu chưa thay 2 giá trị này, website vẫn chạy để test bằng `localStorage`.

Lưu ý: ở chế độ localStorage, dữ liệu chỉ nằm trên đúng trình duyệt/thiết bị đó. Thiết bị khác sẽ không thấy chung dữ liệu.

## 6. Muốn mọi thiết bị gửi vào cùng một danh sách

Bạn cần dùng Supabase.

### Bước 1 — Tạo project Supabase

Tạo một project Supabase mới.

### Bước 2 — Chạy SQL bên dưới

Trong Supabase:

`SQL Editor` → tạo query mới → dán toàn bộ SQL sau → Run.

```sql
-- CHẠY TOÀN BỘ FILE NÀY TRONG SUPABASE > SQL EDITOR
-- Bản này hỗ trợ: cùng SĐT đăng ký lại => cập nhật phiếu mới nhất, không tạo bản trùng.

create extension if not exists pgcrypto;

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  faculty text not null,
  class_name text not null,
  course text not null,
  bans text[] not null default '{}',
  reason text default '',
  strengths text default '',
  expectation text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Bổ sung cột updated_at nếu bảng cũ chưa có
alter table public.registrations
add column if not exists updated_at timestamptz not null default now();

-- Chuẩn hóa dữ liệu cũ trước khi tạo unique index:
-- Nếu đang có nhiều bản trùng SĐT, GIỮ LẠI bản mới nhất và xóa các bản cũ.
with ranked as (
  select id,
         row_number() over (
           partition by regexp_replace(phone, '\\s+', '', 'g')
           order by coalesce(updated_at, created_at) desc, created_at desc
         ) as rn
  from public.registrations
)
delete from public.registrations r
using ranked x
where r.id = x.id
  and x.rn > 1;

-- Chuẩn hóa SĐT đang lưu bằng cách bỏ khoảng trắng
update public.registrations
set phone = regexp_replace(phone, '\\s+', '', 'g');

-- Mỗi SĐT chỉ có đúng 1 hồ sơ
create unique index if not exists registrations_phone_unique
on public.registrations(phone);

alter table public.registrations enable row level security;

-- Người đăng ký được gửi hồ sơ mới.
drop policy if exists "public can insert registrations" on public.registrations;
create policy "public can insert registrations"
on public.registrations
for insert
to anon
with check (true);

-- Cho phép cập nhật hồ sơ khi đăng ký lại cùng SĐT.
drop policy if exists "public can update registration by phone" on public.registrations;
create policy "public can update registration by phone"
on public.registrations
for update
to anon
using (true)
with check (true);

-- Không cho public đọc danh sách.
drop policy if exists "authenticated can read registrations" on public.registrations;
drop policy if exists "authenticated can delete registrations" on public.registrations;

-- Cấu hình Admin
create table if not exists public.admin_config (
  id integer primary key default 1,
  username text not null unique,
  password_hash text not null
);

alter table public.admin_config enable row level security;

insert into public.admin_config(id, username, password_hash)
values (1, 'admin', crypt('CLB2026!', gen_salt('bf')))
on conflict (id) do update
set username = excluded.username,
    password_hash = excluded.password_hash;

create or replace function public.check_clb_admin(p_username text, p_password text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists(
    select 1
    from public.admin_config
    where username = p_username
      and password_hash = crypt(p_password, password_hash)
  );
$$;

create or replace function public.admin_get_registrations(
  p_username text,
  p_password text
)
returns setof public.registrations
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.check_clb_admin(p_username, p_password) then
    raise exception 'Sai tai khoan Admin';
  end if;

  return query
  select *
  from public.registrations
  order by updated_at desc, created_at desc;
end;
$$;

create or replace function public.admin_delete_all_registrations(
  p_username text,
  p_password text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.check_clb_admin(p_username, p_password) then
    raise exception 'Sai tai khoan Admin';
  end if;

  delete from public.registrations;
end;
$$;

grant execute on function public.admin_get_registrations(text,text) to anon;
grant execute on function public.admin_delete_all_registrations(text,text) to anon;


-- ============================================================
-- DANG KY / CAP NHAT THEO SO DIEN THOAI
-- Neu mot SDDT dang ky lai: xoa tat ca ban cu va chi chen ban moi nhat.
-- ============================================================

create or replace function public.submit_registration(
  p_name text,
  p_phone text,
  p_faculty text,
  p_class_name text,
  p_course text,
  p_bans text[],
  p_reason text default '',
  p_strengths text default '',
  p_expectation text default ''
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_phone text := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  v_id uuid;
begin
  if v_phone = '' then
    raise exception 'So dien thoai khong hop le';
  end if;

  delete from public.registrations
  where regexp_replace(phone, '[^0-9]', '', 'g') = v_phone;

  insert into public.registrations (
    name,
    phone,
    faculty,
    class_name,
    course,
    bans,
    reason,
    strengths,
    expectation,
    created_at,
    updated_at
  )
  values (
    p_name,
    v_phone,
    p_faculty,
    p_class_name,
    p_course,
    coalesce(p_bans, '{}'::text[]),
    coalesce(p_reason, ''),
    coalesce(p_strengths, ''),
    coalesce(p_expectation, ''),
    now(),
    now()
  )
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.submit_registration(text,text,text,text,text,text[],text,text,text) to anon;


-- ============================================================
-- TỰ ĐỘNG LỌC TRÙNG THEO SỐ ĐIỆN THOẠI CHO ADMIN
-- Nếu 1 SĐT có nhiều bản cũ: xóa bản cũ, chỉ giữ bản mới nhất.
-- ============================================================

create or replace function public.admin_cleanup_duplicate_phones(
  p_username text,
  p_password text
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer := 0;
begin
  if not public.check_clb_admin(p_username, p_password) then
    raise exception 'Sai tai khoan Admin';
  end if;

  -- Chuẩn hóa SĐT trước khi lọc: bỏ khoảng trắng, dấu -, ngoặc...
  update public.registrations
  set phone = regexp_replace(phone, '[^0-9]', '', 'g')
  where phone is not null;

  -- Xóa các bản trùng, giữ bản có updated_at/created_at mới nhất.
  with ranked as (
    select
      id,
      row_number() over (
        partition by phone
        order by coalesce(updated_at, created_at) desc, created_at desc, id desc
      ) as rn
    from public.registrations
    where phone is not null and phone <> ''
  ),
  deleted as (
    delete from public.registrations r
    using ranked x
    where r.id = x.id
      and x.rn > 1
    returning r.id
  )
  select count(*) into deleted_count from deleted;

  return deleted_count;
end;
$$;

grant execute on function public.admin_cleanup_duplicate_phones(text,text) to anon;

-- Bảo đảm từ nay mỗi SĐT chỉ có đúng 1 hồ sơ.
create unique index if not exists registrations_phone_unique
on public.registrations(phone);

```

### Bước 3 — Lấy Project URL và anon key

Trong Supabase Project Settings/API, lấy:

- Project URL
- anon/public key

Không dùng `service_role key` trong file HTML.

### Bước 4 — Điền vào `index.html`

Tìm:

```js
const SUPABASE_URL = "PASTE_SUPABASE_URL_HERE";
const SUPABASE_ANON_KEY = "PASTE_SUPABASE_ANON_KEY_HERE";
```

Thay thành ví dụ:

```js
const SUPABASE_URL = "https://xxxx.supabase.co";
const SUPABASE_ANON_KEY = "eyJ...";
```

Sau đó lưu file.

## 7. Quy tắc chống đăng ký trùng

Hệ thống nhận diện một người bằng **số điện thoại**.

Ví dụ:

- Lần 1: `0327011851` đăng ký Ban Truyền thông.
- Lần 2: cùng `0327011851` sửa thành Ban Hậu cần.

Kết quả:

- Chỉ còn 1 hồ sơ.
- Admin thấy hồ sơ lần 2.
- Không cộng thành 2 người.

SĐT được chuẩn hóa để bỏ khoảng trắng, dấu `-`, ngoặc và ký tự không phải số khi lọc phía Admin.

## 8. Quy tắc phân nhóm Admin

Trong từng ban, hệ thống xếp chung nhóm khi:

- cùng ban;
- cùng khóa;
- cùng lớp.

Chỉ cùng khóa nhưng khác lớp thì không gom chung.

Cùng lớp/khóa nhưng khác ban thì nằm ở phần ban khác.

Một người chọn 2 ban có thể xuất hiện ở cả 2 khu vực ban.

## 9. Link Zalo

Link hiện tại:

```text
https://zalo.me/g/aathigkjagxqxoplwlcu
```

Link chỉ hiển thị sau khi người dùng gửi phiếu thành công.

Nếu muốn đổi link, tìm `https://zalo.me/g/aathigkjagxqxoplwlcu` trong `index.html` và thay bằng link nhóm mới.

## 10. QR Zalo

HTML đang tham chiếu ảnh:

```text
qr_zalo_k50.jpg
```

Nếu muốn hiện QR, đặt file ảnh `qr_zalo_k50.jpg` cùng thư mục với `index.html`.

Nếu không có ảnh QR, website vẫn hoạt động và nút sang nhóm Zalo vẫn dùng được.

## 11. Đổi tài khoản Admin

Trong `index.html`, tìm:

```js
const ADMIN_USER = "admin";
const ADMIN_PASS = "CLB2026!";
```

Nếu đổi ở đây và đang dùng Supabase, bạn cũng phải đổi tài khoản tương ứng trong phần SQL `admin_config`.

Ví dụ:

```sql
insert into public.admin_config(id, username, password_hash)
values (1, 'admin', crypt('CLB2026!', gen_salt('bf')))
```

Phần username/password trong HTML và SQL phải giống nhau.

## 12. Đưa website lên Internet

Sau khi cấu hình Supabase, `index.html` có thể deploy lên hosting tĩnh như:

- Netlify
- Vercel
- GitHub Pages
- Cloudflare Pages

Vì website là HTML thuần nên không cần build step.

## 13. Lưu ý bảo mật

Bản hiện tại phù hợp cho website CLB quy mô nhỏ.

Tài khoản Admin đang được kiểm tra ở frontend và RPC Supabase. Không đặt `service_role key` trong HTML.

Nếu dùng lâu dài hoặc chứa dữ liệu nhạy cảm hơn, nên chuyển đăng nhập Admin sang Supabase Auth/backend riêng.

## 14. Test trước khi dùng thật

Nên kiểm tra theo thứ tự:

1. Mở form.
2. Chọn 1 hoặc 2 ban.
3. Gửi đăng ký.
4. Kiểm tra màn hình thành công và link Zalo.
5. Đăng nhập Admin bằng `admin / CLB2026!`.
6. Kiểm tra hồ sơ vừa gửi.
7. Gửi lại cùng SĐT với thông tin khác.
8. Vào Admin và xác nhận chỉ còn bản mới nhất.
9. Thử trên điện thoại khác sau khi đã kết nối Supabase.

---

## Thông tin nhanh

```text
Admin username: admin
Admin password: CLB2026!

File chạy website: index.html
Database online: Supabase
Bảng dữ liệu: registrations
Khóa lọc trùng: phone
Phân nhóm: cùng ban + cùng khóa + cùng lớp
Link Zalo: https://zalo.me/g/aathigkjagxqxoplwlcu
```
