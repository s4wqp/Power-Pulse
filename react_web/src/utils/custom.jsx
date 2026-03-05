import toast from 'react-hot-toast';

export const CustomColors = {
    primaryButton: 'var(--color-primary)',
    black: 'var(--color-black)',
    white: 'var(--color-white)',
    textf: 'var(--color-text-field)',
    secondTextf: 'var(--color-text-second)',
    error: 'var(--color-error)'
};

export const showToast = (message, isError = false) => {
    if (isError) {
        toast.error(message, {
            style: {
                background: CustomColors.error,
                color: CustomColors.white,
            },
        });
    } else {
        toast.success(message, {
            style: {
                background: CustomColors.black,
                color: CustomColors.white,
            },
            iconTheme: {
                primary: CustomColors.white,
                secondary: CustomColors.black,
            },
        });
    }
};

export const Typography = {
    mainText: (text) => (
        <h1 style={{
            color: CustomColors.black,
            fontFamily: 'var(--font-family)',
            fontWeight: 'bold',
            fontSize: '30px',
            margin: 0
        }}>
            {text}
        </h1>
    ),
    subMainText: (text) => (
        <h3 style={{
            color: CustomColors.textf,
            fontFamily: 'var(--font-family)',
            fontWeight: 'bold',
            fontSize: '20px',
            margin: 0
        }}>
            {text}
        </h3>
    ),
};
