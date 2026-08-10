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

function authorized(env, username, password){
  const adminUser = env.ADMIN_USER || "admin";
  const adminPass = env.ADMIN_PASS || "CLB2026!";
  return username === adminUser && password === adminPass;
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

function rowToRegistration(row){
  let bans = [];
  try{
    bans = JSON.parse(row.bans || "[]");
  }catch(err){
    bans = [];
  }

  return {
    id: row.id,
    name: row.name,
    phone: normalizePhone(row.phone),
    faculty: row.faculty,
    className: row.class_name,
    course: row.course,
    bans,
    reason: row.reason || "",
    strengths: row.strengths || "",
    expectation: row.expectation || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
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

  if(!authorized(context.env, body.username, body.password)){
    return json({ok:false,error:"Unauthorized."}, 401);
  }

  await ensureSchema(db);

  if(body.action === "clear"){
    await db.prepare("delete from registrations").run();
    return json({ok:true});
  }

  const result = await db.prepare(`
    select *
    from registrations
    order by updated_at desc, created_at desc
  `).all();

  return json({
    ok:true,
    registrations:(result.results || []).map(rowToRegistration)
  });
}
