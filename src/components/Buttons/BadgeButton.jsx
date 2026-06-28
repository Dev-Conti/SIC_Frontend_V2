import PropTypes from "prop-types";
import { Badge, Button } from "@material-tailwind/react";

export default function BadgeButton({ badgeContent, buttonText, onClick }) {
  return (
    <>
      {badgeContent ? (
        <Badge content={badgeContent} style={{ zIndex: 1050, fontSize: '0.75rem' }}>
          <Button onClick={onClick}>{buttonText}</Button>
        </Badge>
      ) : (
        <Button onClick={onClick}>{buttonText}</Button>
      )}
    </>
  );
}

// Definindo os tipos das props
BadgeButton.propTypes = {
  badgeContent: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  buttonText: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

// Definindo valores padrão
BadgeButton.defaultProps = {
  onClick: () => {},
};
