// material-ui
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

// project-imports
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';

// types
import { MailItem } from 'types/mail';

// ==============================|| COMMENT SECTION ||============================== //

export default function CommentSection({ detailData }: { detailData: MailItem | undefined }) {
  return (
    <Stack sx={{ gap: 1 }}>
      {detailData?.comments.map((item, index) => (
        <MainCard key={index} sx={{ bgcolor: 'background.default', p: 2, border: 'none' }} content={false}>
          <Stack direction="row" sx={{ gap: 2 }}>
            <Avatar src={item.avatar} size="sm" />
            <Stack sx={{ gap: 1 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                sx={{ gap: { xs: 0.25, sm: 1 }, alignItems: { xs: 'flex-start', sm: 'center' } }}
              >
                <Typography variant="h5">{item.from}</Typography>
                {item.forwarded?.fromEmail && <Typography color="secondary">{`<${item.forwarded.fromEmail}>`}</Typography>}
              </Stack>
              {item.forwarded && (
                <Typography color="primary">
                  {item.forwarded.date} &nbsp;
                  {item.forwarded.to} {item.forwarded.toEmail}
                </Typography>
              )}
              <Stack sx={{ gap: 0.5 }}>
                {item.text && <Typography>{item.text}</Typography>}
                {item.forwarded?.body && <Typography>{item.forwarded.body}</Typography>}
              </Stack>
            </Stack>
          </Stack>
        </MainCard>
      ))}
    </Stack>
  );
}
