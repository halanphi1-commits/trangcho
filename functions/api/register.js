const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

function json(data, status = 200){
  return new Response(JSON.stringify(data), {status, headers: jsonHeaders});
}

function normalizePhone(phone){
  return String(phone || "").replace(/\D/g, "").trim();
}

function cleanText(value){
  return String(value || "").trim();
}

async function ensureSchema(db){
  await db.prepare(`
    create table if not exists registrations (
      id text primary key,
      name text not null,
      phone text not null unique,
      faculty text not null,
      class_name text not null,
      course text not null,
      bans text not null default '[]',
      reason text not null default '',
      strengths text not null default '',
      expectation text not null default '',
      created_at text not null,
      updated_at text not null
    )
  `).run();
}

export async function onRequestOptions(){
  return new Response(null, {headers: jsonHeaders});
}

export async function onRequestPost(context){
  const db = context.env.DB;
  if(!db) return json({ok:false,error:"D1 binding DB is missing."}, 500);

  let body;
  try{
    body = await context.request.json();
  }catch(err){
    return json({ok:false,error:"Invalid JSON body."}, 400);
  }

  const phone = normalizePhone(body.phone);
  const bans = Array.isArray(body.bans) ? body.bans.slice(0, 2).map(cleanText).filter(Boolean) : [];
  const record = {
    id: crypto.randomUUID(),
    name: cleanText(body.name),
    phone,
    faculty: cleanText(body.faculty),
    className: cleanText(body.className || body.class_name),
    course: cleanText(body.course),
    bans: JSON.stringify(bans),
    reason: cleanText(body.reason),
    strengths: cleanText(body.strengths),
    expectation: cleanText(body.expectation),
    now: new Date().toISOString()
  };

  if(!record.name || !record.phone || !record.faculty || !record.className || !record.course || bans.length === 0){
    return json({ok:false,error:"Missing required registration fields."}, 400);
  }

  await ensureSchema(db);

  await db.prepare(`
    insert into registrations (
      id, name, phone, faculty, class_name, course, bans, reason, strengths, expectation, created_at, updated_at
    )
    values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    on conflict(phone) do update set
      name=excluded.name,
      faculty=excluded.faculty,
      class_name=excluded.class_name,
      course=excluded.course,
      bans=excluded.bans,
      reason=excluded.reason,
      strengths=excluded.strengths,
      expectation=excluded.expectation,
      updated_at=excluded.updated_at
  `).bind(
    record.id,
    record.name,
    record.phone,
    record.faculty,
    record.className,
    record.course,
    record.bans,
    record.reason,
    record.strengths,
    record.expectation,
    record.now,
    record.now
  ).run();

  return json({ok:true});
}
