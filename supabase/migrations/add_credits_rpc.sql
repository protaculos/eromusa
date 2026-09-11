-- Função para adicionar créditos ao saldo do usuário
-- Cria a RPC add_credits que é chamada pelo webhook da Vexutopia

create or replace function add_credits(
  user_uuid uuid,
  amount integer,
  reference_id text,
  description text
) returns void as $$
begin
  -- Cria/atualiza o registro de créditos na tabela user_credits (ou similares)
  insert into user_credits (user_id, balance, total_purchased, updated_at)
  values (user_uuid, amount, amount, now())
  on conflict (user_id)
  do update set
    balance = user_credits.balance + EXCLUDED.balance,
    total_purchased = user_credits.total_purchased + EXCLUDED.total_purchased,
    updated_at = now();
end;
$$ language plpgsql security definer;
